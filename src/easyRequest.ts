import { easyLog } from "@vef/easy-log";
/**
 * EasyRequest is a class that wraps the incoming request object and parses it,
 * providing a more convenient way to access the request properties.
 */
export class EasyRequest {
  /**
   * A boolean indicating if the request is a websocket upgrade request.
   * This is determined by checking if the `Connection` header is `upgrade` and the `Upgrade` header is `websocket`.
   */
  upgradeSocket: boolean = false;

  constructor(request: Request) {
    this.request = request;
    this.headers = new Headers(request.headers);
    this.parseHeaders();
    this.parseParams();
    this.extractCookies();
    this.getAuthToken();
    this.checkForSocketUpgrade();
    this.checkForFileExtension();
  }

  /**
   * The hostname of the request URL.
   * This is the domain part of the URL without the protocol or port.
   *
   * @example
   * for `https://example.com:8080/api/v1/users?group=users`, the host is `example.com`
   */
  host: string = "";

  headers: Headers;

  /**
   * The origin of the request extracted from the `Origin` header.
   * This is only set if the `Origin` header is present in the request, usually for CORS requests from the browser.
   */
  origin: string = "";

  /**
   * The original incoming request object that was passed to the constructor.
   */
  request: Request;

  /**
   * The cookies extracted from the request headers.
   */
  cookies: Map<string, string> = new Map();

  /**
   * The auth token extracted from the `Authorization` header when `Bearer` is used.
   */
  authToken: string | null = null;

  /**
   * The `group` extracted from the query parameters.
   */
  group?: string;

  /**
   * The `action` extracted from the query parameters
   */
  action?: string;

  /**
   * The body of the request. This is a map of key-value pairs.
   * This is loaded in the `loadBody` method.
   */
  body: Map<string, unknown> = new Map();

  /**
   * The body of the request as a JSON object.
   * The body is loaded in the `loadBody` method.
   */
  get bodyJSON(): Record<string, unknown> {
    return Object.fromEntries(this.body);
  }

  /**
   * The HTTP method of the request.
   */
  method:
    | "GET"
    | "POST"
    | "PUT"
    | "DELETE"
    | "PATCH"
    | "OPTIONS"
    | "HEAD"
    | "CONNECT"
    | "TRACE" = "GET";

  /**
   * The query parameters of the request other than `group`, `action`, and `authToken`.
   */
  params: Map<string, unknown> = new Map();

  /**
   * The path of the request URL.
   * This is the part of the URL after the domain and port, including the leading slash.
   * It does not include the query parameters.
   *
   * @example
   * `https://example.com:8080/api/v1/users?group=users` => `/api/v1/users`
   */
  path: string = "";

  /**
   * The port of the request URL if it is specified.
   */
  port?: number;

  /**
   * A boolean indicating if the request is for a file.
   * This is determined by checking if the path has a file extension.
   */
  isFile = false;

  /**
   * The file extension of the request if it is a file request.
   */
  fileExtension = "";
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  };

  /**
   * Sets the `isFile` and `fileExtension` properties if the path has a file extension.
   * Helps to easily check if the request is for a file.
   */
  private checkForFileExtension() {
    const pathParts = this.path.split("/");
    const lastPart = pathParts[pathParts.length - 1];
    const parts = lastPart.split(".");
    if (parts.length < 2) {
      return;
    }
    const ext = parts[parts.length - 1];
    if (ext) {
      this.isFile = true;
      this.fileExtension = ext;
    }
  }

  /**
   * This is called in the constructor to check if the request is a websocket upgrade request.
   * This sets the `upgradeSocket` property to true if the request is a websocket upgrade request.
   * Can be used later to easily check if the request is a websocket upgrade request.
   */
  private checkForSocketUpgrade() {
    let connection = "";
    let upgrade = "";
    this.request.headers.forEach((value, key) => {
      if (key.toLowerCase() === "connection") {
        connection = value.toLowerCase();
      }
      if (key.toLowerCase() === "upgrade") {
        upgrade = value.toLowerCase();
      }
    });
    this.upgradeSocket = connection === "upgrade" &&
      upgrade === "websocket";
  }

  /**
   * Extracts the auth token from the request headers and sets it to the `authToken` property.
   * This is called in the constructor.
   */
  private getAuthToken() {
    const authHeader = this.request.headers.get("Authorization");

    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length === 2 && parts[0].toLowerCase() === "bearer") {
        this.authToken = parts[1];
      }
    }
  }

  /**
   * Extracts the cookies from the request headers and sets them to the `cookies` property.
   * This is called in the constructor.
   */
  private extractCookies() {
    const cookie = this.request.headers.get("cookie");

    if (cookie) {
      const cookiePairs = cookie.split(";");
      cookiePairs.forEach((pair) => {
        const [key, value] = pair.trim().split("=");
        this.cookies.set(key, value);
      });
    }
  }

  /**
   * Parses the request headers and sets the relevant properties.
   */

  private parseHeaders() {
    this.origin = this.headers.get("origin") || "";
  }

  /**
   * Parses the request URL and sets the relevant properties.
   * Any query parameters other than `group`, `action`, and `authToken` are set to the `params` property and are merged with the body later.
   */
  private parseParams() {
    const url = new URL(this.request.url);
    this.method = this.request.method as
      | "GET"
      | "POST"
      | "PUT"
      | "DELETE"
      | "PATCH"
      | "OPTIONS"
      | "HEAD"
      | "CONNECT"
      | "TRACE";
    this.path = url.pathname;
    this.port = parseInt(url.port);
    this.host = url.hostname;
    const params = url.searchParams;
    for (const [key, value] of params) {
      switch (key) {
        case "group":
          this.group = value;
          break;
        case "action":
          this.action = value;
          break;
        case "authToken":
          this.authToken = value;
          break;
        default:
          this.params.set(key, value);
      }
    }
  }

  /**
   * Loads the body of the request and sets it to the `body` property.
   * This merges the query parameters with the body, giving preference to the body.
   */
  async loadBody(): Promise<void> {
    this.body = new Map([...this.params]);
    try {
      const body = await this.request.json();
      if (typeof body === "object") {
        for (const [key, value] of Object.entries(body)) {
          this.body.set(key, value);
        }
      }
    } catch (_e) {
      if (_e instanceof SyntaxError) {
        return;
      }
      easyLog.error(_e);
    }
  }
}
