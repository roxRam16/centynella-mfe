/**
 * Acceso a la API expuesto a los remotes (`centynella_shell/services`).
 *
 * `apiRequest` ya trae el token de sesión, el reintento ante un 401 (renueva y reintenta una
 * vez) y la URL base del backend: un remote NUNCA debe armar su propio `fetch` ni manejar
 * tokens — así toda la plataforma comparte una sola sesión y un solo lugar donde arreglar
 * un problema de autenticación.
 */
export { apiRequest } from '@/services/apiClient';
export type { ApiRequestOptions, HttpMethod } from '@/services/apiClient';
export { HttpError } from '@/services/httpClient';
