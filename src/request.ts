import { NEW_LINE, PROTOCOL } from "./common.ts";

export enum Method {
  HEAD = "HEAD",
  GET = "GET",
  POST = "POST",
}

const EMPTY_BODY_METHODS = [Method.GET, Method.HEAD];

export class Request {
  private _rawMethod: Method;
  private _rawPath: string;
  private _rawHeaders?: Record<string, string>;
  private _rawBody?: string;

  public static isEmptyBody(method: Method): boolean {
    return EMPTY_BODY_METHODS.includes(method);
  }

  constructor(
    method: Method,
    path: string,
    headers?: Record<string, string>,
    body?: string,
  ) {
    this._rawMethod = method;
    this._rawPath = path;
    this._rawHeaders = headers;
    this._rawBody = body;
  }

  public get method(): Method {
    return this._rawMethod;
  }

  public get head(): string {
    return `${this._rawMethod} ${this._rawPath} ${PROTOCOL}${NEW_LINE}`;
  }

  public get headers(): string {
    if (!this.isEmptyBody) {
      if (!this._rawHeaders!["Content-Type"]) {
        throw new Error("missing request header: Content-Type");
      }

      this._rawHeaders!["Content-Length"] = (this._rawBody?.length || 0)
        .toString();
    }

    let headersStr = "";

    for (const [key, value] of Object.entries(this._rawHeaders!)) {
      headersStr = `${headersStr}${key}: ${value}${NEW_LINE}`;
    }

    return headersStr;
  }

  public get body(): string {
    if (this.isEmptyBody) {
      return "";
    }

    return this._rawBody || "";
  }

  public get isEmptyBody(): boolean {
    return Request.isEmptyBody(this._rawMethod);
  }

  public toHttp(): string {
    return `${this.head}${this.headers}${NEW_LINE}${this.body}`;
  }
}
