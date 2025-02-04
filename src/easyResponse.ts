import type { HandlerResponse } from "#/extension/pathHandler.ts";

/**
 * A class which simplifies creating responses to client requests.
 */
export class EasyResponse {
  _content?: string | Uint8Array;
  cookies: Record<string, string> = {};

  _headers: Headers = new Headers();

  constructor() {
    this._headers = new Headers();
    // this._headers.set("Access-Control-Allow-Origin", "*");
    this._headers.set("Access-Control-Allow-Credentials", "true");
    this._headers.set(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    );
    this._headers.set("Access-Control-Allow-Headers", "Content-Type");
  }
  setAllowOrigin(origin: string) {
    this._headers.set("Access-Control-Allow-Origin", origin);
  }
  setCookie(key: string, value: string) {
    this.cookies[key] = value;
  }

  setCookies(cookies: Record<string, string>) {
    this.cookies = cookies;
  }

  clearCookie(key: string) {
    this.cookies[key] = "";
  }

  setContent(content: HandlerResponse): void {
    switch (typeof content) {
      case "object":
        this._content = JSON.stringify(content);
        this.setContentType("json");
        break;
      case "string":
        this.setContentType("text");
        this._content = content;
        break;
      case "number":
        this.setContentType("text");
        this._content = content.toString();
        break;
      default:
        this.setContentType("text");
    }
  }

  setContentType(type: "json" | "html" | "text" | "xml" | "file"): void {
    switch (type) {
      case "json":
        this._headers.set("Content-Type", "application/json");
        break;
      case "html":
        this._headers.set("Content-Type", "text/html");
        break;
      case "text":
        this._headers.set("Content-Type", "text/plain");
        break;
      case "xml":
        this._headers.set("Content-Type", "application/xml");
        break;
      case "file":
        this._headers.set("Content-Type", "application/octet-stream");
        break;
      default:
        this._headers.set("Content-Type", "text/plain");
    }
  }
  setResponseCookie(): void {
    const cookiePairs = Object.entries(this.cookies);
    const cookieStrings = cookiePairs.map(([key, value]) => {
      let cookie = `${key}=${value}`;
      if (value === "") {
        cookie += "; Max-Age=0";
      }
      return cookie;
    });
    this._headers.set("Set-Cookie", cookieStrings.join("; "));
  }

  error(message: string, code: number, reason?: string): Response {
    this.setContent({ error: message, code: code, reason: reason });
    this.setResponseCookie();
    return new Response(
      this._content,
      {
        headers: this._headers,
        status: code,
        statusText: reason || "Error",
      },
    );
  }

  redirect(url: string): Response {
    return Response.redirect(url, 302);
  }

  respond(): Response {
    this.setResponseCookie();
    return new Response(
      this._content,
      {
        headers: this._headers,
        status: 200,
        statusText: "OK",
      },
    );
  }
}
