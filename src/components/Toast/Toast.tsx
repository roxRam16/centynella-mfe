import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CheckIcon from '@mui/icons-material/CheckCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import ErrorIcon from '@mui/icons-material/ErrorOutline';
import InfoIcon from '@mui/icons-material/InfoOutlined';
import WarningIcon from '@mui/icons-material/WarningAmber';
import { palette } from '@/theme/palette';
import { elevation } from '@/theme/tokens';

export type ToastSeverity = 'success' | 'info' | 'warning' | 'error';

/** Datos de una notificación. */
export interface ToastData {
  id: string;
  severity: ToastSeverity;
  message: string;
  /** Título opcional en negrita sobre el mensaje. */
  title?: string;
  /** Milisegundos visible; 0 = no se cierra sola. */
  duration: number;
}

const ICONS = {
  success: CheckIcon,
  info: InfoIcon,
  warning: WarningIcon,
  error: ErrorIcon,
} as const;

const enter = {
  '@keyframes toast-enter': {
    from: { opacity: 0, transform: 'translateY(0.75rem)' },
    to: { opacity: 1, transform: 'none' },
  },
  animation: 'toast-enter 200ms ease-out',
  '@media (prefers-reduced-motion: reduce)': { animation: 'none' },
};

/**
 * Cierra la notificación tras `duration` ms. El reloj se PAUSA mientras haya cursor o foco
 * encima (para poder leerla o llegar a su botón) y continúa con el tiempo que faltaba.
 */
function useAutoDismiss(duration: number, onDismiss: () => void, paused: boolean) {
  const remaining = useRef(duration);

  useEffect(() => {
    if (paused || duration === 0) return;
    const startedAt = Date.now();
    const timer = setTimeout(onDismiss, remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [paused, duration, onDismiss]);
}

export interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

/**
 * Notificación breve y no bloqueante ("Usuario creado correctamente"). El estado se comunica
 * con icono + color + texto (no solo color). Se cierra sola, con la X, y se pausa al pasar el
 * cursor o enfocar. El anuncio a lectores de pantalla lo hace la región viva de `ToastViewport`.
 */
export function Toast({ toast, onDismiss }: ToastProps) {
  const { id, severity, title, message, duration } = toast;
  const tone = palette[severity];
  const Icon = ICONS[severity];
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const dismiss = useCallback(() => onDismiss(id), [onDismiss, id]);

  useAutoDismiss(duration, dismiss, hovered || focused);

  return (
    <Box
      data-severity={severity}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      sx={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        width: '100%',
        px: 2,
        py: 1.5,
        backgroundColor: palette.neutral.surface,
        color: palette.neutral.textPrimary,
        border: `1px solid ${tone.border}`,
        borderLeft: `0.375rem solid ${tone.main}`,
        borderRadius: 1,
        boxShadow: elevation[3],
        ...enter,
      }}
    >
      <Icon aria-hidden sx={{ color: tone.main, mt: '2px' }} />
      <Box sx={{ flexGrow: 1, minWidth: 0, overflowWrap: 'anywhere' }}>
        {title && (
          <Typography variant="body2" sx={{ fontWeight: 600, color: tone.main }}>
            {title}
          </Typography>
        )}
        <Typography variant="body2">{message}</Typography>
      </Box>
      <IconButton
        size="small"
        aria-label="Cerrar notificación"
        onClick={dismiss}
        sx={{ color: palette.neutral.textSecondary, mt: '-2px', mr: '-4px' }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </Box>
  );
}
