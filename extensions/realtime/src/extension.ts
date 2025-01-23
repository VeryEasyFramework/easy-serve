import { RealtimeHandler } from "#extensions/realtime/src/realtimeHandler.ts";
import { realtimeMiddleware } from "#extensions/realtime/src/middleware.ts";
import { createServerExtension } from "#/extension/serverExtension.ts";
export const realtimeExtension = createServerExtension({
  name: "realtime",
  description: "Realtime Handler for EasyServe",
  middleware: [realtimeMiddleware],
  install: (_server) => {
    const realtime = new RealtimeHandler();
    return realtime;
  },
});
