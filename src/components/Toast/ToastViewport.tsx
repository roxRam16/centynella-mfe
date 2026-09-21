import Box from '@mui/material/Box';
import { layout } from '@/theme/tokens';
import { Toast } from './Toast';
import type { ToastData } from './Toast';

export interface ToastViewportProps {
  toasts: readonly ToastData[];
  onDismiss: (id: string) => void;
}

/** Nunca `display: none`: una región viva que aparece de golpe no se anuncia de forma fiable. */
const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 1,
  '&:not(:empty)': { mt: 1 },
} as const;

/**
 * Zona donde aparecen las notificaciones: fija, abajo a la izquierda (junto al menú lateral; a todo lo
 * ancho en móvil) y por encima de los modales. Tiene DOS regiones vivas permanentes (existen antes del
 * primer aviso, así los lectores de pantalla sí lo anuncian): éxito/info/aviso son "amables"
 * (`polite`) y los errores interrumpen (`assertive`). Sin `role` propio, para no confundirse con las alertas en línea de las pantallas.
 * `pointer-events: none` en el contenedor para no bloquear clics en lo que queda debajo.
 */
export function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  const renderAll = (items: readonly ToastData[]) =>
    items.map((toast) => <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />);

  return (
    <Box
      component="section"
      aria-label="Notificaciones"
      sx={{
        position: 'fixed',
        zIndex: 'snackbar',
        pointerEvents: 'none',
        // A la izquierda, junto al menú lateral (riel o extendido) sin taparlo.
        left: `calc(var(${layout.sidebarInsetVar}, ${layout.railWidth}) + 1rem)`,
        transition: 'left 200ms ease',
        '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
        right: { xs: '1rem', sm: 'auto' },
        bottom: { xs: '1rem', sm: '1.5rem' },
        width: {
          sm: `min(24rem, calc(100vw - var(${layout.sidebarInsetVar}, ${layout.railWidth}) - 2rem))`,
        },
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box aria-live="polite" sx={stack}>
        {renderAll(toasts.filter((toast) => toast.severity !== 'error'))}
      </Box>
      <Box aria-live="assertive" sx={stack}>
        {renderAll(toasts.filter((toast) => toast.severity === 'error'))}
      </Box>
    </Box>
  );
}
