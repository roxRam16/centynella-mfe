/**
 * Cliente HTTP mínimo sobre `fetch` (patrón Adapter): el resto de la app no depende de
 * `fetch` directamente, así que cambiarlo por axios u otro es un cambio de un solo archivo.
 */

/** Cuerpo de error estándar de CENTYNELLA-CORE (Problem Details, RFC 9457). */
export interface ProblemDetails {
  title?: string;
  status?: number;
  detail?: string;
  /** Código estable para máquinas (`invalid_credentials`, `email_taken`…). */
  code?: string;
  errors?: { loc: (string | number)[]; msg: string }[];
}

/** Error HTTP con el status y, si el backend lo envió, su `code` y detalle. */
export class HttpError extends Error {
  readonly status: number;
  readonly code?: string;
  readonly problem?: ProblemDetails;
  /** Segundos que indica `Retry-After` (bloqueo temporal). */
  readonly retryAfter?: number;

  constructor(status: number, statusText: string, problem?: ProblemDetails, retryAfter?: number) {
    super(problem?.detail ?? `HTTP ${status}${statusText ? ` ${statusText}` : ''}`);
    this.name = 'HttpError';
    this.status = status;
    this.code = problem?.code;
    this.problem = problem;
    this.retryAfter = retryAfter;
  }
}

/** Convierte una respuesta no exitosa en `HttpError`, leyendo el Problem Details si existe. */
export async function toHttpError(response: Response): Promise<HttpError> {
  let problem: ProblemDetails | undefined;
  try {
    problem = (await response.json()) as ProblemDetails;
  } catch {
    problem = undefined; // cuerpo vacío o no JSON (p. ej. 502 de un proxy)
  }
  const retryAfter = Number(response.headers?.get?.('Retry-After')) || undefined;
  return new HttpError(response.status, response.statusText, problem, retryAfter);
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
    throw await toHttpError(response);
  }
  return (await response.json()) as T;
}
