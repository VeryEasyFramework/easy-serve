import { createServerExtension } from "../../../src/extension/serverExtension.ts";
import { StaticFileHandler } from "./staticFileHandler.ts";

const fileServerExtension = createServerExtension({
  name: "fileServer",
  description: "Serve static files",
  config: {
    staticFilesRoot: {
      type: "string",
      description: "Root directory for static files",
      required: true,
      env: "STATIC_FILES_ROOT",
    },
  },
  pathHandlers: [{
    path: "/(.*)",
    description: "Serve static files",
    name: "fileServer",
    async handler(server, inRequest, inResponse) {
      const fileServer = server.getCustomProperty<StaticFileHandler>(
        "fileServer",
      );
      return await fileServer?.serveFile(inRequest.path);
    },
  }],
  install: (server) => {
    const defaultStaticFilesRoot = Deno.cwd() + "/public";
    const staticFilesRoot = server.getExtensionConfigValue(
      "fileServer",
      "staticFilesRoot",
    ) || defaultStaticFilesRoot;
    const fileServer = new StaticFileHandler({
      staticFilesRoot,
    });
    server.addCustomProperty({
      key: "fileServer",
      description: "Serve static files",
      value: fileServer,
    });
    return fileServer;
  },
});
