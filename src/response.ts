import { Headers, NEW_LINE, PROTOCOL } from "./common.ts";
import { Method } from "./request.ts";

export enum Status {
  Ok = "OK",
  BadRequest = "Bad Request",
}

const StatusCodes = new Map<string, Status>([
  ["200", Status.Ok],
  ["400", Status.BadRequest],
]);

const METHOD_WITHOUT_BODY = [Method.HEAD];

export class Response {
  private _rawHead?: string;
  private _rawHeaders?: string;
  private _rawBody?: string;

  public static hasBody(method: Method): boolean {
    return !METHOD_WITHOUT_BODY.includes(method);
  }

  public get contentLength(): undefined | number {
    const contentLength = this.headers.get("Content-Length");

    if (contentLength) {
      return parseInt(contentLength, 10);
    }

    return undefined;
  }

  public get body(): unknown {
    if (!this._rawBody) {
      throw new Error("unable to parse the body, this.rawBody not yet set!");
    }

    return this.parseBody(this._rawBody);
  }

  public get headers(): Headers {
    if (!this._rawHeaders) {
      throw new Error(
        "unable to parse the headers, this.rawHeaders not yet set!",
      );
    }

    return this.parseHeaders(this._rawHeaders);
  }

  public get isChunked(): boolean {
    return this.headers.get("Transfer-Encoding") === "chunked";
  }

  public get status(): Status {
    if (!this._rawHead) {
      throw new Error("unable to parse the status, this.rawHead not yet set!");
    }

    return this.parseHead(this._rawHead);
  }

  public set rawBody(value: string) {
    this._rawBody = value;
  }

  public set rawHeaders(value: string) {
    this._rawHeaders = value;
  }

  public set rawHead(value: string) {
    this._rawHead = value;
  }

  private parseHead(value: string): Status {
    const protocol = value.slice(0, 8);

    if (protocol !== PROTOCOL) throw new Error(`invalid protocol: ${protocol}`);

    const code = value.slice(9, 12);
    const status = StatusCodes.get(code);

    if (!status) throw new Error(`unknow status: ${value.slice(9)}`);

    return status;
  }

  private parseHeaders(value: string): Headers {
    const headers: Headers = new Map();
    const lines = value.replace(/\r?\n*$/, "").split(NEW_LINE);

    for (const line of lines) {
      const [name, value] = line.split(": ");

      headers.set(name, value);
    }

    return headers;
  }

  private parseBody(value: string): unknown {
    switch (this.headers.get("Content-Type")) {
      case "application/json": {
        return JSON.parse(value);
      }
      default: {
        return value;
      }
    }
  }
}
