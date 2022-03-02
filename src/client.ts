import { NEW_LINE } from "./common.ts";
import { Request } from "./request.ts";
import { Response } from "./response.ts";

export class Client {
  readonly #decoder: TextDecoder;
  readonly #encoder: TextEncoder;

  /**
   * Creates a new instance of `Client`.
   * @param {Deno.Conn} conn
   * @returns {Client} The new instance
   */
  constructor(public conn: Deno.Conn) {
    this.#decoder = new TextDecoder();
    this.#encoder = new TextEncoder();
  }

  /**
   * Sends the `request` through the `conn`.
   * @param {Request} request
   * @param {number} y
   * @returns {Promise<Response>} The HTTP response
   */
  async request(request: Request): Promise<Response> {
    // Send the request
    await this.send(request);

    // Read the response
    const response = new Response();
    response.rawHead = await this.readHead();
    response.rawHeaders = await this.readHeaders();
    if (Response.hasBody(request.method)) {
      response.rawBody = await this.readBody(
        response.isChunked,
        response.contentLength,
      );
    }

    return Promise.resolve(response);
  }

  private async readLine(): Promise<string> {
    let result = "";

    while (true) {
      if (result.indexOf("\n") !== -1) {
        const final = result.slice(0, result.length - 2);

        return Promise.resolve(final);
      }

      const buffer = new Uint8Array(1);
      await this.conn.read(buffer);

      result += this.decode(buffer);
    }
  }

  private async readChunk(size: number): Promise<string> {
    const buf = new ArrayBuffer(size);
    const arr = new Uint8Array(buf);

    await this.conn.read(arr);

    return Promise.resolve(this.decode(arr));
  }

  private readHead(): Promise<string> {
    return this.readLine();
  }

  private async readHeaders(): Promise<string> {
    let headers = "";

    while (true) {
      const line = await this.readLine();

      if (line === "") break;

      headers += line;
      headers += NEW_LINE;
    }

    return Promise.resolve(headers);
  }

  private async readBody(
    isChunked: boolean,
    bodySize: undefined | number,
  ): Promise<string> {
    if (!isChunked) {
      if (!bodySize) throw new Error(`invalid Content-Length: ${bodySize}`);

      return this.readChunk(bodySize);
    }

    let body = "";

    while (true) {
      const line = await this.readLine();
      const chunkSize = parseInt(line, 16);

      if (chunkSize === 0) {
        break;
      }

      body += await this.readChunk(chunkSize);
    }

    return Promise.resolve(body);
  }

  private send(request: Request): Promise<number> {
    const requestStr = request.toHttp();
    const encodedRequest = this.encode(requestStr);

    return this.conn.write(encodedRequest);
  }

  private decode(value: Uint8Array): string {
    return this.#decoder.decode(value);
  }

  private encode(value: string): Uint8Array {
    return this.#encoder.encode(value);
  }
}
