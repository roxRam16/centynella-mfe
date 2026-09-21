import { useContext } from 'react';
import { ToastContext } from '@/context/ToastContext';
import type { ToastApi } from '@/context/ToastContext';

/**
 * Lanza notificaciones (toasts): `const toast = useToast(); toast.success('Usuario creado')`.
 * También lo usan los microfrontends remotos (el contexto se comparte desde el shell).
 */
export function useToast(): ToastApi {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>');
  }
  return context;
}
