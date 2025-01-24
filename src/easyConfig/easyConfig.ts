import type { EasyServer } from "#/easyServer.ts";
import { joinPath } from "@vef/easy-utils";

export async function loadEasyConfigFile(): Promise<
  Record<string, any> | undefined
> {
  try {
    const filePath = joinPath(Deno.cwd(), "easyConfig.json");
    const file = await Deno.readTextFile(filePath);
    const config = JSON.parse(file);
    for (const key in config) {
      const extensionConfig = config[key];
      for (const subKey in extensionConfig) {
        const value = extensionConfig[subKey];

        Deno.env.set(subKey, value);
      }
    }
  } catch (e) {
    console.error(e);
    return undefined;
  }
}

export async function generateEasyConfigFile(server: EasyServer) {
  await server.initialized;
  const filePath = joinPath(Deno.cwd(), "_easyConfig.json");
  const masterConfig = new Map<string, any>();
  server.installedExtensions.forEach((extension) => {
    const configDef = extension.config;

    const mappedConfig = new Map<string, any>();
    for (const key in configDef) {
      const config = configDef[key];
      let value: any = "";
      switch (config.type) {
        case "string":
        case "number":
          value = config.default || "";
          break;
        case "boolean":
          value = config.default || false;
          break;
        case "string[]":
          value = config.default || [];
          break;
      }

      mappedConfig.set(config.env!, value);
    }
    masterConfig.set(extension.name, Object.fromEntries(mappedConfig));
  });
  const config = Object.fromEntries(masterConfig);
  const file = JSON.stringify(config, null, 2);
  await Deno.writeTextFile(filePath, file);
}
