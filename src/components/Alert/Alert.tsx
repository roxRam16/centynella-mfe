import type { ReactNode } from 'react';
import MuiAlert from '@mui/material/Alert';
import type { AlertColor } from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';

export type AlertSeverity = AlertColor; // 'success' | 'info' | 'warning' | 'error'

export interface AlertProps {
  /** Define color + icono (codificación redundante: no depende solo del color). */
  severity: AlertSeverity;
  title?: string;
  /** Si se pasa, muestra el botón de cerrar. */
  onClose?: () => void;
  /** Acción contextual (p. ej. un botón "Reintentar"). */
  action?: ReactNode;
  children?: ReactNode;
}

/**
 * Alerta de CENTYNELLA. Usa `role="alert"` para que los lectores de pantalla
 * anuncien el mensaje. El estado se comunica con color, icono y texto a la vez
 * (atributos preatentivos + accesibilidad).
 */
export function Alert({ severity, title, onClose, action, children }: AlertProps) {
  return (
    <MuiAlert severity={severity} variant="outlined" onClose={onClose} action={action}>
      {title && <AlertTitle>{title}</AlertTitle>}
      {children}
    </MuiAlert>
  );
}
