import { createServerExtension } from "../../../src/extension/serverExtensionBak.ts";
import { StaticFileHandler } from "#extensions/static/src/staticFileHandler.ts";

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
    async handler(server, easyRequest, _easyResponse) {
      const fileServer = server.getCustomProperty<StaticFileHandler>(
        "fileServer",
      );
      return await fileServer?.serveFile(easyRequest.path);
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
