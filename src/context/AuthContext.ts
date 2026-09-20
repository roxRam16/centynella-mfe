import { createContext } from 'react';
import type { LoginInput } from '@/services/authService';
import type { Profile, TokenResponse } from '@/services/types';

/** `loading`: restaurando la sesión al abrir la app (no mostrar login todavía). */
export type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

export interface AuthContextValue {
  status: AuthStatus;
  user: Profile | null;
  isAuthenticated: boolean;
  /** Inicia sesión y devuelve el perfil. Lanza `HttpError` si las credenciales son inválidas. */
  login: (input: LoginInput) => Promise<Profile>;
  /** Cierra la sesión aquí y en las demás pestañas. Nunca falla. */
  logout: () => Promise<void>;
  /** Adopta una sesión nueva (p. ej. tras cambiar la contraseña). */
  setSession: (session: TokenResponse) => void;
  /** Actualiza el perfil en memoria (p. ej. tras editar el nombre). */
  updateUser: (user: Profile) => void;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
