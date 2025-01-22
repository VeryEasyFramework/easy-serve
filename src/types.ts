/**
 * Configuration for the InSpatialServer.
 */
export interface ServeConfig {
  /**
   * The hostname to listen on.
   * If not provided, the server will listen on all available interfaces.
   *
   * @example
   * `localhost` or `127.0.0.1`
   */
  hostname?: string;

  /**
   * The port to listen on.
   * If not provided, the server will listen on port `8000`.
   *
   * @example
   * `8080`
   */
  port?: number;
}
