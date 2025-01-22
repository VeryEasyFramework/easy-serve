import { createServerMiddleware } from "../../../mod.ts";
import { RealtimeHandler } from "./realtimeHandler.ts";

export const realtimeMiddleware = createServerMiddleware({
  name: "Realtime Middleware",
  description: "Realtime Middleware for InSpatial Server",
  handler(server, inRequest) {
    if (inRequest.upgradeSocket && inRequest.path === "/ws") {
      const realtime = server.getCustomProperty<RealtimeHandler>("realtime");
      return realtime?.handleUpgrade(inRequest);
    }
  },
});
