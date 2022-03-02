import { Client } from "./client.ts";
import { Method, Request } from "./request.ts";
import { Response } from "./response.ts";

export function head(
  client: Client,
  path: string,
  headers?: Record<string, string>,
): Promise<Response> {
  const request = new Request(Method.HEAD, path, headers);

  return client.request(request);
}

export function get(
  client: Client,
  path: string,
  headers?: Record<string, string>,
): Promise<Response> {
  const request = new Request(Method.GET, path, headers);

  return client.request(request);
}
