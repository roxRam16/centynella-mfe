/** Autenticación: llamadas a `/api/v1/auth` y al perfil propio. */
import { apiRequest } from './apiClient';
import { HttpError } from './httpClient';
import type { Profile, TokenResponse } from './types';

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput extends LoginInput {
  name: string;
}

export const login = (input: LoginInput): Promise<TokenResponse> =>
  apiRequest<TokenResponse>('/auth/login', { method: 'POST', body: input, auth: false });

export const register = (input: RegisterInput): Promise<void> =>
  apiRequest<void>('/auth/register', { method: 'POST', body: input, auth: false });

export const logout = (): Promise<void> =>
  apiRequest<void>('/auth/logout', { method: 'POST', auth: false });

export const requestPasswordReset = (email: string): Promise<void> =>
  apiRequest<void>('/auth/password-reset-requests', {
    method: 'POST',
    body: { email },
    auth: false,
  });

export const resetPassword = (token: string, password: string): Promise<void> =>
  apiRequest<void>('/auth/password-resets', {
    method: 'POST',
    body: { token, password },
    auth: false,
  });

export const getProfile = (signal?: AbortSignal): Promise<Profile> =>
  apiRequest<Profile>('/users/me', { signal });

export const updateProfile = (name: string): Promise<Profile> =>
  apiRequest<Profile>('/users/me', { method: 'PATCH', body: { name } });

/** Cambia la contraseña. El backend cierra las demás sesiones y devuelve una nueva para este equipo. */
export const changePassword = (
  currentPassword: string,
  newPassword: string,
): Promise<TokenResponse> =>
  apiRequest<TokenResponse>('/users/me/password', {
    method: 'PUT',
    body: { current_password: currentPassword, new_password: newPassword },
  });

async function requestRefresh(): Promise<TokenResponse | null> {
  try {
    return await apiRequest<TokenResponse>('/auth/refresh', { method: 'POST', auth: false });
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) return null; // no hay sesión
    throw error;
  }
}

/** Serializa la renovación entre pestañas (Web Locks) cuando el navegador lo soporta. */
async function refreshAcrossTabs(): Promise<TokenResponse | null> {
  const locks = typeof navigator !== 'undefined' ? navigator.locks : undefined;
  if (!locks) return requestRefresh();
  return await locks.request('centynella-refresh', () => requestRefresh());
}

let inflightRefresh: Promise<TokenResponse | null> | null = null;

/**
 * Renueva la sesión con la cookie del refresh token. Devuelve `null` si no hay sesión.
 * Es "single-flight": varias llamadas simultáneas comparten UNA petición (el refresh token
 * rota en cada uso; dos peticiones a la vez la invalidarían).
 */
export function refreshSession(): Promise<TokenResponse | null> {
  inflightRefresh ??= refreshAcrossTabs().finally(() => {
    inflightRefresh = null;
  });
  return inflightRefresh;
}
