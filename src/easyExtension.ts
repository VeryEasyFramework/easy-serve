import type { ConfigDefinition } from "#/types.ts";
import type { RequestExtension } from "#/extension/requestExtension.ts";
import type { ServerMiddleware } from "#/extension/serverMiddleware.ts";
import type { PathHandler } from "#/extension/pathHandler.ts";
import type { EasyServe } from "#/easyServe.ts";

/**
 * An extension for EasyServe.
 */
export class EasyExtension<N extends string, R> {
  readonly name: N;
  envPrefix?: string;
  config?: ConfigDefinition;
  readonly description: string;
  readonly requestExtensions: RequestExtension[];
  readonly middleware: ServerMiddleware[];
  readonly pathHandlers: PathHandler[];
  install: (server: EasyServe) => R;
  /**
   * Creates a new EasyExtension.
   *
   * @param name The name of the extension.
   * @param options The options for the extension.
   */
  static create<
    N extends string,
    I extends (server: EasyServe) => any,
  >(
    name: N,
    options: {
      description: string;
      envPrefix?: string;
      config?: ConfigDefinition;
      requestExtensions?: RequestExtension[];
      middleware?: ServerMiddleware[];
      pathHandlers?: PathHandler[];
      install: I;
    },
  ): EasyExtension<N, ReturnType<I>> {
    return new EasyExtension(name, options);
  }
  private constructor(name: N, options: {
    description: string;
    envPrefix?: string;
    config?: ConfigDefinition;
    requestExtensions?: RequestExtension[];
    middleware?: ServerMiddleware[];
    pathHandlers?: PathHandler[];
    install: (server: EasyServe) => R;
  }) {
    this.name = name;
    this.envPrefix = options.envPrefix;
    this.config = options.config;
    this.description = options.description;
    this.requestExtensions = options.requestExtensions || [];
    this.middleware = options.middleware || [];
    this.pathHandlers = options.pathHandlers || [];
    this.install = options.install;
  }
}
