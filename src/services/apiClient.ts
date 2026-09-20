/**
 * Cliente de la API de negocio (`/api/v1`).
 *
 *  · Adjunta el access token (`Authorization: Bearer`) desde `tokenStore`.
 *  · Envía la cookie de sesión (`credentials: 'include'`) para los endpoints `/auth`.
 *  · Si una petición autenticada devuelve 401, intenta renovar la sesión UNA vez y la reintenta:
 *    el usuario no nota que su access token (15 min) venció.
 *  · Traduce los errores a `HttpError` con su `code`.
 */
import { config } from '@/config/env';
import { toHttpError } from './httpClient';
import { tokenStore } from './tokenStore';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface ApiRequestOptions {
  method?: HttpMethod;
  body?: unknown;
  query?: Record<string, string | number | boolean | undefined | null>;
  signal?: AbortSignal;
  /** `false` para endpoints públicos (login, registro…): sin token y sin reintento por 401. */
  auth?: boolean;
}

/** Función que intenta renovar la sesión; devuelve `true` si lo logró. */
export type SessionRefresher = () => Promise<boolean>;

let refresher: SessionRefresher | null = null;

/**
 * Registra quién renueva la sesión (lo hace `AuthProvider`). Inversión de dependencias:
 * el cliente HTTP no conoce el contexto de React ni el servicio de autenticación.
 */
export function registerSessionRefresher(fn: SessionRefresher | null): void {
  refresher = fn;
}

function buildUrl(path: string, query: ApiRequestOptions['query']): string {
  const url = new URL(`${config.apiBaseUrl}/api/v1${path}`);
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

async function send(path: string, options: ApiRequestOptions): Promise<Response> {
  const { method = 'GET', body, query, signal, auth = true } = options;
  const headers: Record<string, string> = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  return fetch(buildUrl(path, query), {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
    credentials: 'include',
    signal,
  });
}

/**
 * Petición a la API. Devuelve el JSON (o `undefined` en 204).
 * @throws HttpError si la respuesta no es 2xx (tras el reintento por 401, si aplica).
 */
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  let response = await send(path, options);

  if (response.status === 401 && options.auth !== false && refresher && (await refresher())) {
    response = await send(path, options); // reintento con el access token nuevo
  }

  if (!response.ok) {
    throw await toHttpError(response);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}
