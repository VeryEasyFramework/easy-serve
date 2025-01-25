/**
 * API Extension for {@link EasyServe}
 * @module apiExtension
 */
import { EasyExtension } from "#/easyExtension.ts";

import { apiHandler } from "#extensions/api/src/apiHandler.ts";
import { EasyAPI } from "#extensions/api/src/easyApi.ts";

export { EasyAPI } from "#extensions/api/src/easyApi.ts";
export type {
  EasyAPIAction,
  EasyAPIActionDocs,
  EasyAPIDocs,
  EasyAPIGroup,
  EasyAPIGroupDocs,
} from "#extensions/api/src/types.ts";

/**
 * API Extension for {@link EasyServe}
 *
 * @example
 * ```ts
 * import { EasyServe } from "@vef/easy-serve";
 * import apiExtension from "@vef/easy-serve/api";
 *
 * const server = await EasyServe.create({
 *  extensions: [apiExtension],
 * });
 *
 * server.run();
 * ```
 */
const apiExtension: EasyExtension<
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

export default apiExtension;
