import EasyExtension from "#/easyExtension.ts";
import { apiHandler } from "./apiHandler.ts";
import { EasyAPI } from "#extensions/api/src/easyApi.ts";

/**
 * API Extension for EasyServe
 * @category Extensions
 */
export const apiExtension: EasyExtension<
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
