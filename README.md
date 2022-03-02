# HTTP Client

This project provides a simple HTTP client for [Deno](https://deno.land/).

## Usage

To use the library, you need to instanciate a `HttpClient` object and pass an `HttpRequest` to the method `HttpClient.prototype.request`.

The class `HttpClient` expects a connection as `Deno.Conn`.

```typescript
import {
  HttpClient,
  HttpMethod,
  HttpRequest,
} from "https://deno.land/x/http_client@v0.0.2/mod.ts";

// Docker socket
const conn = await Deno.connect({
  path: "/var/run/docker.sock",
  transport: "unix",
});

// Instanciates the HttpClient
const client = new HttpClient(conn);

// Creates a HttpRequest
const request = new HttpRequest(HttpMethod.GET, "/_ping", {
  "Host": "localhost",
  "Accept": "application/json",
});

// Sends the request
const response = await client.request(request);

console.log(response);

```

Result:

```typescript
Response {
  _rawHead: "HTTP/1.1 200 OK",
  _rawHeaders: "Api-Version: 1.41\r\nBuilder-Version: 2\r\nCache-Control: no-cache, no-store, must-revalidate\r\nContent-T...",
  _rawBody: "OK"
}
```

### Helpers

Some helpers are also available:

```typescript
import {
  Helpers as http,
  HttpClient,
} from "https://deno.land/x/http_client@v0.0.2/mod.ts";

// Docker socket
const conn = await Deno.connect({
  path: "/var/run/docker.sock",
  transport: "unix",
});

// Instanciates the HttpClient
const client = new HttpClient(conn);

// Uses the helper
const response = await http.get(client, "/_ping", {
  "Host": "localhost",
  "Accept": "application/json",
});

console.log(response);
```

## License

[MIT License](LICENSE)
