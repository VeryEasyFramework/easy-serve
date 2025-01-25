import { EasyExtension } from "#/easyExtension.ts";

/**
 * CORS Extension for {@link EasyServe}
 * @module
 */
export const corsExtension: EasyExtension<"CORS", void> = EasyExtension.create(
  "CORS",
  {
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
      handler(server, easyRequest, easyResponse) {
        const origins = server.getExtensionConfigValue<Set<string>>(
          "CORS",
          "allowedOrigins",
        );
        if (origins?.has(easyRequest.origin)) {
          easyResponse.setAllowOrigin(easyRequest.origin);
        }
      },
    }],
  },
);

export default corsExtension;
