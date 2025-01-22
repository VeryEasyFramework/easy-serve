import { createServerExtension } from "../../../mod.ts";
import { apiHandler } from "./apiHandler.ts";
import { EasyAPI } from "./easyApi.ts";

export const apiExtension = createServerExtension({
  name: "easyApi",
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
