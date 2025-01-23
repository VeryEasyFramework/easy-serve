import type { PathHandler } from "./pathHandler.ts";
import type { RequestExtension } from "./requestExtension.ts";
import type { EasyServer } from "../easyServer.ts";
import type { ServerMiddleware } from "./serverMiddleware.ts";
import type { ConfigDefinition } from "#/types.ts";
import { camelToSnakeCase } from "@vef/easy-utils";

export type InstallFunction<R = any> = (server: EasyServer) => R;

export type ExtractInstallReturn<I extends InstallFunction> = I extends
  InstallFunction<infer R> ? R : never;

export type ServerExtension<
  I extends InstallFunction = InstallFunction,
  C extends ConfigDefinition = ConfigDefinition,
> = {
  name: string;
  envPrefix?: string;
  config?: C extends ConfigDefinition<infer K> ? ConfigDefinition<K> : C;
  description: string;
  requestExtensions?: RequestExtension[];
  middleware?: ServerMiddleware[];
  pathHandlers?: PathHandler[];
  install: I extends InstallFunction<infer R> ? InstallFunction<R> : I;
};

interface DetailInfo {
  name: string;
  description: string;
}
export type ServerExtensionInfo = {
  name: string;
  description: string;
  config: ConfigDefinition;
  requestExtensions: DetailInfo[];
  middleware: DetailInfo[];
  pathHandlers: DetailInfo[];
};
export function createServerExtension<
  C extends ConfigDefinition,
  I extends InstallFunction,
  T extends ServerExtension<I, C>,
>(
  extension: T,
): T {
  if (extension.config) {
    const envPrefix = extension.envPrefix;
    for (const key in extension.config) {
      const config = extension.config[key];
      if (!config.env) {
        config.env = camelToSnakeCase(key).toUpperCase();
      }
      if (envPrefix) {
        config.env = `${envPrefix}_${config.env}`;
      }
      extension.config[key] = config;
      delete extension.envPrefix;
    }
  }
  return extension;
}
