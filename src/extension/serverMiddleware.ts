import type { EasyRequest } from "#/easyRequest.ts";

import type { EasyResponse } from "#/easyResponse.ts";
import type { EasyServe } from "#/easyServe.ts";

/**
 * Middleware for EasyServe.
 */
export type ServerMiddleware = {
  /**
   * The name of the middleware.
   * This should be unique. If a middleware with the same name is added more than once, an error will be thrown, preventing the server from starting.
   */
  name: string;
  /**
   * A description of what the middleware does.
   */
  description: string;
  /**
   * The handler for the middleware.
   * If the handler returns a response, the response will be sent to the client immediately,
   * skipping any further middleware or request handling.
   */
  handler: (
    server: EasyServe,
    easyRequest: EasyRequest,
    easyResponse: EasyResponse,
  ) => Promise<void | EasyResponse | Response> | void | EasyResponse | Response;
};

/**
 * Creates a middleware for EasyServe.
 */
export function createServerMiddleware(
  serverMiddleware: ServerMiddleware,
): ServerMiddleware {
  return serverMiddleware;
}
