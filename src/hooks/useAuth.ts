import { useContext } from 'react';
import { AuthContext } from '@/context/AuthContext';
import type { AuthContextValue } from '@/context/AuthContext';

/**
 * Sesión del usuario: estado, perfil, `login`/`logout` y `hasPermission`.
 * También lo usan los microfrontends remotos (el contexto se comparte desde el shell).
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  }
  return context;
}
