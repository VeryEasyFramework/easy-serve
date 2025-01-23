import type { RealtimeHandler } from "#extensions/realtime/src/realtimeHandler.ts";
import { createServerMiddleware } from "#/extension/serverMiddleware.ts";
export const realtimeMiddleware = createServerMiddleware({
  name: "Realtime Middleware",
  description: "Realtime Middleware for EasyServe",
  handler(server, easyRequest) {
    if (easyRequest.upgradeSocket && easyRequest.path === "/ws") {
      const realtime = server.getCustomProperty<RealtimeHandler>("realtime");
      return realtime?.handleUpgrade(easyRequest);
    }
  },
});
