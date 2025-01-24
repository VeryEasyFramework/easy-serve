import { RealtimeHandler } from "#extensions/realtime/src/realtimeHandler.ts";
import { realtimeMiddleware } from "#extensions/realtime/src/realtimeMiddleware.ts";
import EasyExtension from "#/easyExtension.ts";

const realtimeExtension = EasyExtension.create("realtime", {
  description: "Realtime Handler for EasyServe",
  middleware: [realtimeMiddleware],
  install: (_server) => {
    const realtime = new RealtimeHandler();
    return realtime;
  },
});

export default realtimeExtension;
