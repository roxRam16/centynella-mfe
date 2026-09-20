import { createTheme } from '@mui/material/styles';
import { palette } from './palette';

/**
 * Tema MUI de CENTYNELLA. Único punto donde se traducen los tokens de
 * `palette.ts` a la librería de UI (así cambiar de librería no toca la paleta).
 * Los remotes deben consumir este mismo tema desde el shell para mantener coherencia visual.
 */
export const theme = createTheme({
  palette: {
    primary: palette.primary,
    secondary: palette.secondary,
    success: palette.success,
    warning: palette.warning,
    error: palette.error,
    info: palette.info,
    background: { default: palette.neutral.background, paper: palette.neutral.surface },
    text: { primary: palette.neutral.textPrimary, secondary: palette.neutral.textSecondary },
    divider: palette.neutral.divider,
  },
  shape: { borderRadius: 8 },
  typography: {
    fontFamily: [
      'system-ui',
      '-apple-system',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
    // Jerarquía por tamaño y peso (atributos preatentivos): el ojo ubica lo importante primero.
    h1: { fontSize: 'clamp(1.75rem, 4vw, 2.5rem)', fontWeight: 700, lineHeight: 1.2 },
    h2: { fontSize: 'clamp(1.35rem, 3vw, 1.75rem)', fontWeight: 600, lineHeight: 1.3 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  components: {
    MuiButton: { defaultProps: { disableElevation: true } },
  },
});
