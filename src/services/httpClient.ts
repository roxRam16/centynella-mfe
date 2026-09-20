/**
 * Cliente HTTP mínimo sobre `fetch` (patrón Adapter): el resto de la app no
 * depende de `fetch` directamente, así que cambiarlo por axios u otro es un
 * cambio de un solo archivo.
 */

/** Error HTTP con el status recibido, para que la UI pueda decidir qué mostrar. */
export class HttpError extends Error {
  readonly status: number;

  constructor(status: number, statusText: string) {
    super(`HTTP ${status}${statusText ? ` ${statusText}` : ''}`);
    this.name = 'HttpError';
    this.status = status;
  }
}

/**
 * GET tipado que devuelve el JSON de la respuesta.
 *
 * @param url URL absoluta.
 * @param signal Permite cancelar la petición (p. ej. al desmontar un componente).
 * @throws HttpError si el status no es 2xx.
 */
export async function httpGet<T>(url: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!response.ok) {
    throw new HttpError(response.status, response.statusText);
  }
  return (await response.json()) as T;
}
