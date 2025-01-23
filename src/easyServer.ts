import { EasyRequest } from "#/easyRequest.ts";
import { EasyResponse } from "#/easyResponse.ts";
import type { PathHandler } from "#/extension/pathHandler.ts";
import type { RequestExtension } from "#/extension/requestExtension.ts";
import { isServerException } from "#/serverException.ts";
import type {
  ExtractInstallReturn,
  InstallFunction,
  ServerExtension,
  ServerExtensionInfo,
} from "#/extension/serverExtension.ts";
import type { ServerMiddleware } from "#/extension/serverMiddleware.ts";
import type { ServeConfig } from "#/types.ts";
import type { ConfigDefinition, ExtensionConfig } from "#/types.ts";
import { loadEasyConfigFile } from "#/easyConfig/easyConfig.ts";
import { easyLog } from "@vef/easy-log";

/**
 * The main server class.
 * This is used to create a new server instance.
 *
 * @example
 * ```ts
 * import { EasyServer } from "@vef/easy-serve";
 *
 * const server = new EasyServer();
 *
 * server.run();
 * ```
 */

export class EasyServer {
  /**
   * This fetch method is not intended to be called directly. It's purpose is so that the EasyServer instance can be exported as the default
   * and the `deno serve` command can be used to run the server.
   *
   * This is useful when self hosting the server and you want to run parallel processes.
   *
   * @example
   * ```ts
   * import { EasyServe } from "#serve";
   *
   * const server = new EasyServer();
   *
   * // install extensions and middleware
   *
   * export default server;
   *
   * ```
   *
   * Then in the terminal:
   *
   * ```sh
   * deno serve main.ts
   * ```
   *
   * or for running parallel processes:
   * ```sh
   * deno serve --parallel main.ts
   * ```
   */
  fetch: (request: Request) => Promise<Response> = this._requestHandler.bind(
    this,
  );

  /**
   * The request extensions that have been added to the server.
   * These are used to modify the EasyRequest object before it's used in further middleware or request handling.
   */
  private _requestExtensions: Map<string, RequestExtension> = new Map();

  private _middlewares: Map<string, ServerMiddleware> = new Map();
  private _pathHandlers: Map<string, PathHandler> = new Map();

  private _customProperties: Map<string, unknown> = new Map();

  private _extensionsConfig: Map<string, Map<string, any>> = new Map();

  private _config: ServeConfig = {
    hostname: undefined,
    port: undefined,
  };
  private _installedExtensions: Set<any> = new Set();

  readonly initialized: Promise<void>;

  /**
   * The installed extensions that have been added to the server.
   */
  get installedExtensions(): ServerExtensionInfo[] {
    return Array.from(this._installedExtensions);
  }

  addCustomProperty(prop: {
    key: string;
    description: string;
    value: unknown;
  }) {
    Object.defineProperty(this, prop.key, {
      get: () => this._customProperties.get(prop.key),

      enumerable: true,
    });

    this._customProperties.set(prop.key, prop.value);
  }

  getCustomProperty<T>(key: string): T | undefined {
    return this._customProperties.get(key) as T;
  }
  constructor(config?: ServeConfig) {
    if (config) {
      this._config = config;
    }

    if (Deno.env.has("SERVE_PORT")) {
      this._config.port = Number(Deno.env.get("SERVE_PORT"));
    }
    if (Deno.env.has("SERVE_HOSTNAME")) {
      this._config.hostname = Deno.env.get("SERVE_HOSTNAME");
    }
    this.fetch.bind(this);
    this.initialized = new Promise((resolve) => {
      loadEasyConfigFile().then(() => {
        resolve();
      });
    });
  }
  /**
   * Adds an extension to the `EasyRequest` class.
   * This can be used to add custom functionality to the the request object
   * before it's used in further middleware or request handling.
   */
  private extendRequest(extension: RequestExtension) {
    if (this._requestExtensions.has(extension.name)) {
      throw new Error(
        `Request extension with name ${extension.name} already exists`,
      );
    }
    this._requestExtensions.set(extension.name, extension);
  }

  /**
   * Adds a middleware to the server.
   * Middleware are functions that are called before the request is handled.
   * A common use case for middleware is to add authentication or logging to the server.
   *
   * Middleware can be async and can modify the request and response objects.
   *
   * If a middleware returns a response, the response will be sent to the client immediately,
   * skipping any further middleware or request handling.
   */
  private addMiddleware(middleware: ServerMiddleware) {
    if (this._middlewares.has(middleware.name)) {
      throw new Error(
        `Middleware with name ${middleware.name} already exists`,
      );
    }
    this._middlewares.set(middleware.name, middleware);
  }

  /**
   * Adds a handler for a path.
   * This is used to define a handler for a specific path.
   */
  private addPathHandler(handler: PathHandler) {
    const paths = Array.isArray(handler.path) ? handler.path : [handler.path];
    for (const path of paths) {
      if (this._pathHandlers.has(path)) {
        throw new Error(`Path handler for path ${path} already exists`);
      }
      this._pathHandlers.set(path, handler);
    }
  }

  /**
   * Sets the configuration value for a given key in an extension.
   *
   * @param extension {string} The name of the extension
   * @param key {string} The key of the configuration value
   * @param value {unknown} The value to set
   */
  setExtensionConfigValue(
    extension: string,
    key: string,
    value: unknown,
  ) {
    const config = this._extensionsConfig.get(extension);
    if (!config) {
      throw new Error(`Extension ${extension} not found`);
    }
    if (Array.isArray(value)) {
      value = new Set(value);
    }
    config.set(key, value);
  }

  /**
   * Gets the configuration value for a given key in an extension.
   *
   * @param extension {string} The name of the extension
   * @param key {string} The key of the configuration value
   */
  getExtensionConfigValue<T = any>(
    extension: string,
    key: string,
  ): T {
    const config = this._extensionsConfig.get(extension);
    if (!config) {
      throw new Error(`Extension ${extension} not found`);
    }
    const value = config.get(key);

    return value;
  }

  getExtensionConfig<T = Record<string, any>>(extension: string) {
    const config = this._extensionsConfig.get(extension);
    if (config === undefined) {
      throw new Error(`Extension ${extension} not found`);
    }
    return Object.fromEntries(config) as T;
  }

  getExtension<T>(name: string) {
    return this.getCustomProperty<T>(name);
  }
  private setupExtensionConfig(
    extension: ServerExtension<InstallFunction, ConfigDefinition>,
    config?: ExtensionConfig<any>,
  ) {
    this._extensionsConfig.set(extension.name, new Map());
    const configDefinition = extension.config;
    if (!configDefinition) {
      return;
    }
    if (config) {
      for (const key in config) {
        if (!configDefinition[key]) {
          continue;
        }
        this.setExtensionConfigValue(extension.name, key, config[key]);
      }
    }

    for (const key in configDefinition) {
      const def = configDefinition[key];
      const envKey = extension.envPrefix
        ? `${extension.envPrefix}_${def.env}`
        : def.env!;
      const value = Deno.env.get(envKey) ||
        this.getExtensionConfigValue(extension.name, key) || def.default;
      if (def.required && !value) {
        easyLog.warning(`Missing required environment variable ${envKey}`);
      }
      if (value === undefined) {
        continue;
      }
      switch (def.type) {
        case "string[]":
          try {
            const arr = value.replaceAll(/[\[\]]/g, "").split(",").map((v) =>
              v.trim()
            );
            this.setExtensionConfigValue(extension.name, key, arr);
          } catch (e) {
            console.error(e);
          }
          break;
        case "number":
          this.setExtensionConfigValue(extension.name, key, Number(value));
          break;
        case "boolean": {
          const trueValues = ["true", "1", "yes"];
          const falseValues = ["false", "0", "no"];
          if (trueValues.includes(value)) {
            this.setExtensionConfigValue(extension.name, key, true);
            continue;
          }
          if (falseValues.includes(value)) {
            this.setExtensionConfigValue(extension.name, key, false);
          }

          break;
        }
        default:
          this.setExtensionConfigValue(extension.name, key, value);
      }
    }
  }
  /**
   * Installs a server extension.
   * This is used to add custom functionality to the server.
   */

  async installExtension<
    C extends ConfigDefinition,
    I extends InstallFunction,
    T extends ServerExtension<I, C>,
  >(
    extension: T extends ServerExtension<infer R, infer E>
      ? ServerExtension<R, E>
      : T,
    config?: T extends ServerExtension<infer R, infer E> ? ExtensionConfig<E>
      : ExtensionConfig<C>,
  ): Promise<ExtractInstallReturn<T["install"]>> {
    await this.initialized;
    if (extension.requestExtensions) {
      for (const requestExtension of extension.requestExtensions) {
        this.extendRequest(requestExtension);
      }
    }
    if (extension.middleware) {
      for (const middleware of extension.middleware) {
        this.addMiddleware(middleware);
      }
    }
    if (extension.pathHandlers) {
      for (const pathHandler of extension.pathHandlers) {
        this.addPathHandler(pathHandler);
      }
    }

    this.setupExtensionConfig(extension, config);
    this.addExtensionInfo(extension);
    const extensionObject = extension.install(this);
    this.addCustomProperty({
      key: extension.name,
      description: extension.description,
      value: extensionObject,
    });
    return extensionObject;
  }

  /**
   * Adds information about the installed extension.
   */
  private addExtensionInfo(extension: ServerExtension<any, any>) {
    const middleware = extension.middleware?.map((m) => {
      return {
        name: m.name,
        description: m.description,
      };
    }) || [];

    const pathHandlers = extension.pathHandlers?.map((p) => {
      return {
        name: p.name,
        path: p.path,
        description: p.description,
      };
    }) || [];

    const requestExtensions = extension.requestExtensions?.map((r) => {
      return {
        name: r.name,
        description: r.description,
      };
    }) || [];
    this._installedExtensions.add({
      name: extension.name,
      config: extension.config,
      description: extension.description,
      middleware,
      pathHandlers,
      requestExtensions,
    });
  }
  /**
   * The main entry point for the server.
   */
  run(): Deno.HttpServer<Deno.NetAddr> {
    return this.serve();
  }

  private async _requestHandler(request: Request): Promise<Response> {
    const easyRequest = new EasyRequest(
      request,
    );

    for (const extension of this._requestExtensions.values()) {
      extension.handler(easyRequest);
    }

    const easyResponse = new EasyResponse();

    for (const middleware of this._middlewares.values()) {
      const response = await middleware.handler(
        this,
        easyRequest,
        easyResponse,
      );
      if (response instanceof EasyResponse) {
        return response.respond();
      }
      if (response instanceof Response) {
        return response;
      }
    }

    if (easyRequest.method === "OPTIONS") {
      return easyResponse.respond();
    }

    const currentPath = easyRequest.path;

    let pathHandler: PathHandler | undefined = this._pathHandlers.get(
      currentPath,
    );
    if (!pathHandler) {
      const pathHandlers = Array.from(this._pathHandlers.keys());
      for (const path of pathHandlers) {
        if (currentPath.startsWith(path)) {
          pathHandler = this._pathHandlers.get(path);
          break;
        }
      }
    }
    if (pathHandler) {
      try {
        const response = await pathHandler.handler(
          this,
          easyRequest,
          easyResponse,
        );
        if (response instanceof EasyResponse) {
          return response.respond();
        }
        if (response) {
          easyResponse.setContent(response);
        }
      } catch (error) {
        if (isServerException(error)) {
          return easyResponse.error(error.message, error.status);
        }
        console.error(error);
        return easyResponse.error(
          "An error occurred while processing the request",
          500,
        );
      }
    }
    return easyResponse.respond();
  }
  private serve(): Deno.HttpServer<Deno.NetAddr> {
    return Deno.serve(
      {
        hostname: this._config.hostname,
        port: this._config.port,
      },
      this._requestHandler.bind(this),
    );
  }
}
