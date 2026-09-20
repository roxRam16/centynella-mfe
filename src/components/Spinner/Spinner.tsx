import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export interface SpinnerProps {
  /** Texto para lectores de pantalla (y visible si `showLabel`). */
  label?: string;
  showLabel?: boolean;
  /** Ocupa toda la pantalla (p. ej. mientras se restaura la sesión). */
  fullPage?: boolean;
}

/** Indicador de carga con `role="status"` para que se anuncie de forma cortés. */
export function Spinner({
  label = 'Cargando…',
  showLabel = false,
  fullPage = false,
}: SpinnerProps) {
  return (
    <Box
      role="status"
      aria-live="polite"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
        ...(fullPage ? { minHeight: '100dvh' } : { py: 4 }),
      }}
    >
      <CircularProgress aria-hidden />
      {showLabel ? (
        <Typography color="text.secondary">{label}</Typography>
      ) : (
        <Box component="span" sx={visuallyHidden}>
          {label}
        </Box>
      )}
    </Box>
  );
}

const visuallyHidden = {
  position: 'absolute',
  width: 1,
  height: 1,
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
} as const;
