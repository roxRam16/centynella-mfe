import { createTheme } from '@mui/material/styles';
import type { Shadows } from '@mui/material/styles';
import { palette } from './palette';
import { elevation, fontFamily, fontFamilyDisplay, radius } from './tokens';

const focusRing = `0 0 0 3px ${palette.focus.ring}`;

const { gradient } = palette;
const reducedMotion = '@media (prefers-reduced-motion: reduce)';

/**
 * Botón relleno con degradado: normal → hover (más claro + resplandor) → pressed (más oscuro).
 * `loading` conserva el degradado; deshabilitado pasa a un gris plano.
 */
const gradientButton = (
  fallback: string,
  base: string,
  hover: string,
  pressed: string,
  glow: string,
) => ({
  backgroundColor: fallback,
  backgroundImage: base,
  transition: 'box-shadow 200ms ease, transform 200ms ease',
  [reducedMotion]: { transition: 'none' },
  '&:hover': {
    backgroundColor: fallback,
    backgroundImage: hover,
    boxShadow: glow,
    transform: 'translateY(-1px)',
    [reducedMotion]: { transform: 'none' },
  },
  '&:active': {
    backgroundColor: fallback,
    backgroundImage: pressed,
    boxShadow: 'none',
    transform: 'none',
  },
  '&.Mui-disabled': {
    backgroundImage: 'none',
    backgroundColor: palette.neutral.border,
    color: palette.neutral.disabled,
  },
  '&.MuiButton-loading': { backgroundImage: base, backgroundColor: fallback },
});

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
    // Escala compacta. Jerarquía por tamaño y peso (atributos preatentivos). Títulos y botones en
    // Raleway (display, con cifras alineadas a la línea base); el resto del texto en Poppins.
    h1: {
      fontFamily: fontFamilyDisplay,
      fontSize: 'clamp(1.5rem, 3.4vw, 1.75rem)',
      fontWeight: 800,
      lineHeight: 1.25,
      fontVariantNumeric: 'lining-nums',
    },
    h2: {
      fontFamily: fontFamilyDisplay,
      fontSize: 'clamp(1.125rem, 2.6vw, 1.375rem)',
      fontWeight: 700,
      lineHeight: 1.3,
      fontVariantNumeric: 'lining-nums',
    },
    h3: {
      fontFamily: fontFamilyDisplay,
      fontSize: '1rem',
      fontWeight: 700,
      lineHeight: 1.4,
      fontVariantNumeric: 'lining-nums',
    },
    subtitle1: {
      fontFamily: fontFamilyDisplay,
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.8125rem', lineHeight: 1.6 },
    caption: { fontSize: '0.75rem', lineHeight: 1.5 },
    button: {
      fontFamily: fontFamilyDisplay,
      fontSize: '0.8125rem',
      fontWeight: 700,
      letterSpacing: '0.02em',
      textTransform: 'none',
    },
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
        // Estados de la guía (Normal → Hover → Pressed) con degradado de marca ("estética IA").
        containedPrimary: gradientButton(
          palette.primary.main,
          gradient.primary,
          gradient.primaryHover,
          gradient.primaryPressed,
          gradient.glow,
        ),
        containedSecondary: gradientButton(
          palette.secondary.main,
          gradient.secondary,
          gradient.secondaryHover,
          gradient.secondaryPressed,
          gradient.glow,
        ),
        containedError: gradientButton(
          palette.error.main,
          gradient.danger,
          gradient.dangerHover,
          gradient.dangerPressed,
          '0 6px 20px rgba(185, 28, 28, 0.4)',
        ),
        // Contorno con degradado (borde) sobre relleno blanco; al pasar el cursor, relleno suave.
        outlinedPrimary: {
          border: '1.5px solid transparent',
          color: palette.primary.main,
          background: `linear-gradient(${palette.neutral.surface}, ${palette.neutral.surface}) padding-box, ${gradient.primary} border-box`,
          '&:hover': {
            border: '1.5px solid transparent',
            background: `${gradient.soft} padding-box, ${gradient.primary} border-box`,
            boxShadow: elevation[2],
          },
          '&:active': {
            border: '1.5px solid transparent',
            background: `${gradient.primary} border-box`,
            color: palette.primary.contrastText,
          },
          '&.Mui-disabled': { border: `1.5px solid ${palette.neutral.border}`, background: 'none' },
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
          fontSize: '0.8125rem',
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
        root: { fontSize: '0.78125rem', fontWeight: 500, color: palette.neutral.textPrimary },
      },
    },
    MuiFormHelperText: {
      styleOverrides: { root: { marginInline: 0, fontSize: '0.71875rem' } },
    },
    MuiLink: {
      defaultProps: { underline: 'hover' },
      styleOverrides: { root: { fontWeight: 600, color: palette.primary.main } },
    },
    MuiChip: {
      styleOverrides: { root: { fontWeight: 500, borderRadius: radius.full } },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: 3,
          borderRadius: radius.full,
          backgroundColor: palette.primary.main,
          backgroundImage: gradient.primary,
        },
      },
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
    MuiTableCell: {
      styleOverrides: {
        root: { fontSize: '0.8125rem', paddingBlock: 12 },
        head: { fontWeight: 600, color: palette.neutral.textPrimary },
      },
    },
    MuiCard: {
      styleOverrides: { root: { borderRadius: radius.medium, backgroundImage: 'none' } },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&.Mui-selected, &.Mui-selected:hover': {
            color: palette.primary.contrastText,
            backgroundColor: palette.primary.main,
            backgroundImage: gradient.primary,
          },
        },
      },
    },
    // Interruptor: pista gris (apagado) o con degradado de marca (encendido).
    MuiSwitch: {
      styleOverrides: {
        root: { width: '2.75rem', height: '1.5rem', padding: 0, overflow: 'visible' },
        switchBase: {
          padding: '0.125rem',
          color: palette.neutral.surface,
          '&.Mui-checked': {
            transform: 'translateX(1.25rem)',
            color: palette.neutral.surface,
            '& + .MuiSwitch-track': { backgroundImage: gradient.primary, opacity: 1 },
          },
          '&.Mui-focusVisible + .MuiSwitch-track': { boxShadow: focusRing },
        },
        thumb: {
          width: '1.25rem',
          height: '1.25rem',
          boxShadow: '0 1px 3px rgba(10, 10, 18, 0.35)',
        },
        track: {
          borderRadius: radius.full,
          backgroundColor: '#8B92A3', // 3.1:1 sobre blanco (mínimo para componentes de interfaz)
          opacity: 1,
        },
      },
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
