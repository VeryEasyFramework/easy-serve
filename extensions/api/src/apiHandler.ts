import type { PathHandler } from "#/extension/pathHandler.ts";
import type { EasyAPI } from "#extensions/api/src/easyApi.ts";
import { raiseServerException } from "#/serverException.ts";

export const apiHandler: PathHandler = {
  name: "api",
  description: "api",
  path: "/api",
  handler: async (server, easyRequest, easyResponse) => {
    await easyRequest.loadBody();
    const data = easyRequest.body;
    const api = server.getExtension<EasyAPI>("easyApi");
    const action = api?.getAction(easyRequest.group, easyRequest.action);
    if (!action) {
      raiseServerException(
        404,
        `Action not found: ${easyRequest.group}/${easyRequest.action}`,
      );
    }
    console.log(Object.fromEntries(data));
    return await action.handler(data, server, easyRequest, easyResponse);
  },
};
