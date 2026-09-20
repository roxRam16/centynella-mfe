/**
 * Almacén del access token: SOLO en memoria.
 *
 * No se usa localStorage/sessionStorage a propósito: cualquier script inyectado (XSS) podría
 * leerlos. La persistencia de la sesión la da la cookie HttpOnly del refresh token, que
 * JavaScript no puede leer; al recargar la página se pide un access token nuevo con ella.
 */
let accessToken: string | null = null;

export const tokenStore = {
  get: (): string | null => accessToken,
  set: (token: string): void => {
    accessToken = token;
  },
  clear: (): void => {
    accessToken = null;
  },
};
