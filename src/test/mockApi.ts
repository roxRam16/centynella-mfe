/**
 * `fetch` simulado por ruta para pruebas. Los handlers reciben la petición ya interpretada
 * y devuelven `{ status?, json?, headers? }` (o `undefined` para 204).
 *
 *   const api = mockApi({ 'POST /api/v1/auth/login': () => ({ json: tokenResponse }) });
 *   ...
 *   expect(api.calls[0].body).toEqual({...});
 *
 * Una petición sin handler hace fallar la prueba (así no se cuelan llamadas inesperadas).
 */
import type { Mock } from 'vitest';

export interface MockRequest {
  method: string;
  path: string;
  url: URL;
  body: unknown;
  headers: Record<string, string>;
  credentials?: RequestCredentials;
}

export interface MockResult {
  status?: number;
  json?: unknown;
  headers?: Record<string, string>;
}

export type MockHandler = (
  request: MockRequest,
) => MockResult | undefined | Promise<MockResult | undefined>;

export interface MockApi {
  calls: MockRequest[];
  fetch: Mock;
  /** Peticiones hechas a `METHOD /ruta`. */
  callsTo: (route: string) => MockRequest[];
}

export function mockApi(routes: Record<string, MockHandler>): MockApi {
  const calls: MockRequest[] = [];

  const fetchMock = vi.fn(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    const url = new URL(input.toString());
    const method = (init.method ?? 'GET').toUpperCase();
    const request: MockRequest = {
      method,
      path: url.pathname,
      url,
      body: typeof init.body === 'string' ? JSON.parse(init.body) : undefined,
      headers: (init.headers ?? {}) as Record<string, string>,
      credentials: init.credentials,
    };
    calls.push(request);

    const handler = routes[`${method} ${url.pathname}`];
    if (!handler) {
      throw new Error(`mockApi: falta un handler para "${method} ${url.pathname}"`);
    }
    const result = await handler(request);
    const status = result?.status ?? (result?.json === undefined ? 204 : 200);
    return new Response(status === 204 ? null : JSON.stringify(result?.json ?? {}), {
      status,
      headers: { 'Content-Type': 'application/json', ...result?.headers },
    });
  });

  vi.stubGlobal('fetch', fetchMock);

  return {
    calls,
    fetch: fetchMock,
    callsTo: (route) => calls.filter((call) => `${call.method} ${call.path}` === route),
  };
}

/** Respuesta de error estándar del backend (Problem Details). */
export const problem = (
  status: number,
  code: string,
  detail: string,
  headers?: Record<string, string>,
) => ({
  status,
  json: { title: 'Error', status, code, detail },
  headers,
});
