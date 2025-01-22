import { createServerExtension } from "../../../mod.ts";
import { RealtimeHandler } from "./realtimeHandler.ts";
import { realtimeMiddleware } from "./middleware.ts";

export const realtimeExtension = createServerExtension({
  name: "realtime",
  description: "Realtime Handler for EasyServe",
  middleware: [realtimeMiddleware],
  install: (_server) => {
    const realtime = new RealtimeHandler();
    return realtime;
  },
});
