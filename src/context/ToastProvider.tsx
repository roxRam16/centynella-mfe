import { useCallback, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { ToastViewport } from '@/components/Toast';
import type { ToastData, ToastSeverity } from '@/components/Toast';
import { ToastContext } from './ToastContext';
import type { ToastApi, ToastOptions } from './ToastContext';

/** Máximo de avisos a la vez: al pasar de aquí se descartan los más antiguos. */
export const MAX_TOASTS = 4;

/** Duración por defecto: los errores se quedan más tiempo (hay que leerlos y entenderlos). */
const DEFAULT_DURATION: Record<ToastSeverity, number> = {
  success: 5000,
  info: 5000,
  warning: 7000,
  error: 8000,
};

/**
 * Sistema de notificaciones de la app. Se monta UNA vez, por encima del enrutador, así un aviso
 * sobrevive a una navegación (p. ej. "cuenta creada" al pasar del registro al login).
 * El valor del contexto es estable: usar `useToast()` en un efecto no lo re-dispara.
 */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const api = useMemo<ToastApi>(() => {
    const push = (severity: ToastSeverity, message: string, options: ToastOptions = {}) => {
      counter.current += 1;
      const toast: ToastData = {
        id: `toast-${counter.current}`,
        severity,
        message,
        title: options.title,
        duration: options.duration ?? DEFAULT_DURATION[severity],
      };
      setToasts((current) =>
        // Un mismo aviso repetido reemplaza al anterior (y reinicia su tiempo) en vez de apilarse.
        [
          ...current.filter((item) => item.severity !== severity || item.message !== message),
          toast,
        ].slice(-MAX_TOASTS),
      );
    };

    return {
      success: (message, options) => push('success', message, options),
      info: (message, options) => push('info', message, options),
      warning: (message, options) => push('warning', message, options),
      error: (message, options) => push('error', message, options),
      clear: () => setToasts([]),
    };
  }, []);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
