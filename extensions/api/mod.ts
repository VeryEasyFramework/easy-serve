import { apiExtension } from "./src/apiExtension.ts";
export { apiExtension };
export { EasyAPI } from "#extensions/api/src/easyApi.ts";
export type {
  EasyAPIAction,
  EasyAPIActionDocs,
  EasyAPIDocs,
  EasyAPIGroup,
  EasyAPIGroupDocs,
} from "#extensions/api/src/types.ts";
export { apiHandler } from "#extensions/api/src/apiHandler.ts";

export default apiExtension;
