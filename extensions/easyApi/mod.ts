/**
 * API Extension for {@link EasyServe}
 * @module easyApi
 * @example
 * ```ts
 * import { EasyServe } from "@vef/easy-serve";
 * import easyApi from "@vef/easy-serve/easyApi";
 *
 * const server = await EasyServe.create({
 *  extensions: [easyApi],
 * });
 *
 * server.run();
 * ```
 */
import { EasyExtension } from "#/easyExtension.ts";

import { apiHandler } from "#extensions/easyApi/src/apiHandler.ts";
import { EasyAPI } from "#extensions/easyApi/src/easyApi.ts";

export { EasyAPI } from "#extensions/easyApi/src/easyApi.ts";
export type {
  EasyAPIAction,
  EasyAPIActionDocs,
  EasyAPIDocs,
  EasyAPIGroup,
  EasyAPIGroupDocs,
} from "./src/types.ts";

/**
 * API Extension for {@link EasyServe}
 */
const easyApi: EasyExtension<
  "easyApi",
  EasyAPI
> = EasyExtension.create("easyApi", {
  description: "API handler for EasyServe",
  pathHandlers: [apiHandler],
  install: (_server) => {
    const api = new EasyAPI();
    api.addGroup({
      groupName: "api",
      description: "API",
      actions: new Map(),
    });
    api.addAction("api", {
      actionName: "getDocs",
      description: "Get API documentation",
      params: {},
      handler: () => {
        return api.docs;
      },
    });

    return api;
  },
});

export default easyApi;
