/**
 * `EasyServe` is used under the hood by `EasyApp` and handles the web server
 * setup, configuration and core functionality.
 *
 * It is designed as a standalone module that can be used as an easy to use
 * and extensible web server for any Deno project.
 *
 * @module EasyServe
 */
import { EasyServe } from "#/easyServe.ts";

export { EasyServe } from "#/easyServe.ts";
export { EasyRequest } from "#/easyRequest.ts";
export { EasyResponse } from "#/easyResponse.ts";
export { EasyExtension } from "#/easyExtension.ts";
export {
  isServerException,
  raiseServerException,
  ServerException,
} from "#/serverException.ts";
export type { PathHandler } from "#/extension/pathHandler.ts";
export {
  createServerMiddleware,
  type ServerMiddleware,
} from "#/extension/serverMiddleware.ts";
export type { RequestExtension } from "#/extension/requestExtension.ts";
export type { ServeConfig } from "#/types.ts";
export default EasyServe;
