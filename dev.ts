import { EasyServe } from "#/easyServe.ts";
import apiExtension from "#extensions/api/mod.ts";
import corsExtension from "#extensions/cors/mod.ts";
import realtimeExtension from "#extensions/realtime/mod.ts";
const server = await EasyServe.create({
  extensions: [apiExtension, corsExtension, realtimeExtension],
});

const api = server.getExtension("easyApi");
api.addAction("api", {
  actionName: "getExtensions",
  description: "Get all extensions",
  handler: (_data, server) => {
    return server.installedExtensions;
  },
  params: {},
});
const cors = server.getExtension("CORS");
export default server;
