import { createServerExtension } from "../../../mod.ts";

export const corsExtension = createServerExtension(
  {
    name: "CORS",
    description: "CORS Handler for EasyServe",
    envPrefix: "CORS",
    config: {
      allowedOrigins: {
        description: "Allowed Origins",
        required: false,
        type: "string[]",
      },
    },
    install: () => {},
    middleware: [{
      name: "CORS Middleware",
      description: "CORS Middleware for EasyServe",
      handler(server, inRequest, inResponse) {
        const origins = server.getExtensionConfigValue<Set<string>>(
          "CORS",
          "allowedOrigins",
        );
        if (origins?.has(inRequest.origin)) {
          inResponse.setAllowOrigin(inRequest.origin);
        }
      },
    }],
  },
);
