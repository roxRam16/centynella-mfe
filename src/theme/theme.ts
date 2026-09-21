import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { palette } from './palette';
import { elevation, fontFamily, radius } from './tokens';

const focusRing = `0 0 0 3px ${palette.focus.ring}`;

/** Sombras MUI (25 niveles): los tres primeros son las elevaciones de marca. */
const shadows = [...createTheme().shadows] as Shadows;
shadows[1] = elevation[1];
shadows[2] = elevation[2];
shadows[3] = elevation[3];

/**
 * Tema MUI de CENTYNELLA. Único punto donde los tokens (`palette.ts`, `tokens.ts`) se traducen
 * a la librería de UI: cambiar de librería no toca la paleta ni los tokens.
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
    text: {
      primary: palette.neutral.textPrimary,
      secondary: palette.neutral.textSecondary,
      disabled: palette.neutral.disabled,
    },
    divider: palette.neutral.border,
  },
  shape: { borderRadius: radius.medium },
  shadows,
  typography: {
    fontFamily,
    // Escala de la guía. Jerarquía por tamaño y peso (atributos preatentivos).
    h1: { fontSize: 'clamp(1.75rem, 4vw, 2rem)', fontWeight: 700, lineHeight: 1.25 },
    h2: { fontSize: 'clamp(1.25rem, 3vw, 1.5rem)', fontWeight: 600, lineHeight: 1.3 },
    h3: { fontSize: '1.125rem', fontWeight: 600, lineHeight: 1.4 },
    subtitle1: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.5 },
    body1: { fontSize: '1rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: { fontSize: '0.875rem', fontWeight: 600, textTransform: 'none' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        // Barras de desplazamiento delgadas y discretas (pulgar iris, pista transparente).
        // `scrollbar-width` NO se hereda, por eso va en todos los elementos (páginas, modales, tablas).
        html: { scrollbarColor: `${palette.scrollbar.thumb} transparent` },
        '*': { scrollbarWidth: 'thin' },
        body: { WebkitFontSmoothing: 'antialiased' },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true, disableRipple: false },
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingInline: 24,
          '&.Mui-focusVisible': { boxShadow: focusRing },
        },
        // Estados de la guía: Normal → Hover (más claro) → Pressed (más oscuro).
        containedPrimary: {
          '&:hover': { backgroundColor: palette.primary.hover },
          '&:active': { backgroundColor: palette.primary.dark },
        },
        containedSecondary: {
          '&:hover': { backgroundColor: palette.secondary.light },
          '&:active': { backgroundColor: palette.secondary.dark },
        },
        outlinedPrimary: {
          borderColor: palette.primary.main,
          '&:hover': {
            backgroundColor: palette.brand.lightPink,
            borderColor: palette.primary.main,
          },
          '&:active': {
            backgroundColor: palette.primary.light,
            color: palette.primary.contrastText,
          },
        },
        // "Text link": sin caja, subrayado al pasar el cursor.
        text: {
          paddingInline: 8,
          '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radius.small,
          backgroundColor: palette.neutral.surface,
          fontSize: '0.875rem',
          '& .MuiOutlinedInput-notchedOutline': { borderColor: palette.neutral.border },
          '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: palette.brand.iris },
          '&.Mui-focused': { boxShadow: focusRing },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: palette.focus.border,
            borderWidth: 1,
          },
          '&.Mui-error .MuiOutlinedInput-notchedOutline': { borderColor: palette.error.main },
        },
        input: {
          paddingBlock: 10,
          '&::placeholder': { color: palette.neutral.textPlaceholder, opacity: 1 },
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', fontWeight: 500, color: palette.neutral.textPrimary },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginInline: 0, fontSize: '0.75rem' } },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { fontWeight: 600, color: palette.primary.main } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: radius.full } },
    },
    MuiTabs: {
      styleOverrides: { indicator: { height: 2, backgroundColor: palette.primary.main } },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 44,
          fontWeight: 500,
          color: palette.neutral.textSecondary,
          '&.Mui-selected': { color: palette.primary.main, fontWeight: 600 },
        },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: radius.medium, backgroundImage: 'none' } },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: palette.neutral.textSecondary,
          '&.Mui-checked': { color: palette.primary.main },
        },
      },
    },
  },
});
