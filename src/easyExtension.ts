import type { ConfigDefinition } from "#/types.ts";
import type { RequestExtension } from "#/extension/requestExtension.ts";
import type { ServerMiddleware } from "#/extension/serverMiddleware.ts";
import type { PathHandler } from "#/extension/pathHandler.ts";
import { EasyServe } from "#/easyServe.ts";
class EasyExtension<N extends string, R> {
  readonly name: N;
  envPrefix?: string;
  config?: ConfigDefinition;
  readonly description: string;
  readonly requestExtensions: RequestExtension[];
  readonly middleware: ServerMiddleware[];
  readonly pathHandlers: PathHandler[];
  install: (server: EasyServe) => R;
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

export default EasyExtension;
