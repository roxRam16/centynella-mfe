/**
 * Paleta de CENTYNELLA — fuente única de color de todo el proyecto.
 *
 * Origen: guía de estilo de marca (mockups/styles.jpg): esquema MONOCROMÁTICO azul + iris.
 *   Blue #2D28F3 · Iris #6E6DF8 · Violet #7D58E0 · Light pink #D1CFF7 · Light blue #EEF3F9 · Dark gray #2B3037
 *
 * Teoría del color aplicada:
 *  · Regla 60-30-10 → 60 % neutros (lightBlue/blanco), 30 % iris-azules (marca), 10 % violet (acento).
 *  · El azul transmite confianza; el iris aporta un toque distintivo → identidad fiable e innovadora.
 *  · Colores semánticos (verde/ámbar/rojo) = atributos PREATENTIVOS: se distinguen antes de leer.
 *    Siempre van con icono y texto (no dependen solo del color → accesible a daltonismo).
 *
 * Accesibilidad (WCAG AA, verificada en palette.test.ts):
 *  · Texto ≥ 4.5:1. Iris (#6E6DF8) sobre blanco da 4.03:1: solo para decoración y texto grande.
 *  · Violet (#7D58E0) como TEXTO solo sobre blanco (4.83:1); sobre el fondo lightBlue da 4.33:1.
 *  · Los bordes de campos siguen el diseño (sutiles); el foco usa borde violet + anillo visible.
 */

export const brand = {
  blue: '#2D28F3',
  iris: '#6E6DF8',
  violet: '#7D58E0',
  lightPink: '#D1CFF7',
  lightBlue: '#EEF3F9',
  darkGray: '#2B3037',
} as const;

export const palette = {
  brand,
  primary: {
    light: brand.iris,
    main: brand.blue,
    hover: '#4A46F5', // más claro al pasar el cursor (guía: Hover)
    dark: '#1E1AB8', // más oscuro al presionar (guía: Pressed)
    contrastText: '#FFFFFF',
  },
  secondary: {
    light: '#9B7FEA',
    main: brand.violet,
    dark: '#5B3DB5',
    contrastText: '#FFFFFF',
  },
  // Estados: `main` para texto/iconos, `bg` para el fondo tenue y `border` para el borde de alertas.
  success: {
    light: '#22C55E',
    main: '#15803D',
    dark: '#14532D',
    bg: '#EAF6EE',
    border: '#9AD1AE',
    contrastText: '#FFFFFF',
  },
  warning: {
    light: '#F59E0B',
    main: '#B45309',
    dark: '#78350F',
    bg: '#FEF6E1',
    border: '#F2CF7A',
    contrastText: '#FFFFFF',
  },
  error: {
    light: '#EF4444',
    main: '#B91C1C',
    dark: '#7F1D1D',
    bg: '#FDECEC',
    border: '#F3A9A9',
    contrastText: '#FFFFFF',
  },
  info: {
    light: brand.iris,
    main: brand.blue,
    dark: '#1E1AB8',
    bg: '#ECEBFE',
    border: '#B9B7FA',
    contrastText: '#FFFFFF',
  },
  neutral: {
    background: brand.lightBlue,
    surface: '#FFFFFF',
    surfaceAlt: '#FAF8FD', // panel de la ilustración del login
    border: '#D5D9E5',
    textPrimary: brand.darkGray,
    textSecondary: '#5B6270',
    textPlaceholder: '#666D7B', // ≥ 4.5:1 sobre blanco Y sobre el fondo lightBlue
    disabled: '#9AA0AE',
  },
  // Encabezado del shell: degradado de marca Blue → Violet (nunca el azul solo).
  // Ambos extremos dan ≥ 4.5:1 con texto blanco (ver palette.test.ts).
  header: {
    gradient: `linear-gradient(90deg, ${brand.blue} 0%, ${brand.violet} 100%)`,
    text: '#FFFFFF',
  },
  // Menú lateral: negro SUAVE (no #000) para que descanse la vista y combine con el degradado.
  sidebar: {
    background: '#1F2430',
    hover: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.10)',
    text: '#E7E9F0',
    textMuted: '#A9AFC0',
    activeBackground: brand.violet, // ítem seleccionado (texto blanco: 4.83:1)
    activeText: '#FFFFFF',
    badgeWarning: '#F59E0B', // insignia SANDBOX
  },
  focus: {
    border: brand.violet,
    ring: 'rgba(110, 109, 248, 0.35)', // halo iris
  },
} as const;

export type SemanticColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
