import { createContext } from 'react';

export interface ToastOptions {
  /** Título opcional en negrita. */
  title?: string;
  /** Milisegundos visible (por defecto según el tipo); 0 = permanece hasta cerrarla. */
  duration?: number;
}

/** API para lanzar notificaciones: `toast.success('Usuario creado correctamente')`. */
export interface ToastApi {
  success: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  /** Cierra todas las notificaciones visibles. */
  clear: () => void;
}

export const ToastContext = createContext<ToastApi | null>(null);
