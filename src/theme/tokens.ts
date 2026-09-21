/**
 * Tokens de diseño distintos del color (guía "Product UI Styleguide").
 * Los componentes usan estos valores; nunca números sueltos.
 */

/** Escala de espaciado en px (4 · 8 · 16 · 24 · 32 · 48). */
export const spacing = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;

/** Radios: none 0 · small 4 · medium 8 · large 16 · full (píldora/círculo). */
export const radius = { none: 0, small: 4, medium: 8, large: 16, full: 9999 } as const;

/**
 * Elevación (niveles 0-3). La sombra lleva un tinte azul de marca en lugar de gris neutro:
 * es lo que da el "resplandor" suave de la guía.
 */
export const elevation = {
  0: 'none',
  1: '0 1px 2px rgba(45, 40, 243, 0.08)',
  2: '0 4px 12px rgba(45, 40, 243, 0.12)',
  3: '0 12px 28px rgba(45, 40, 243, 0.18)',
} as const;

export type ElevationLevel = keyof typeof elevation;

const systemFonts = ['system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'Arial', 'sans-serif'];

/** Familia de texto y controles (Poppins, ver mockups/style_fonts.png) con respaldo de sistema. */
export const fontFamily = ['"Poppins"', ...systemFonts].join(',');

/**
 * Familia "display" para títulos y botones: Raleway, de trazo fino y elegante, que da el aire
 * moderno/tecnológico. Se combina con Poppins (texto) para que el contenido siga siendo legible.
 */
export const fontFamilyDisplay = ['"Raleway"', ...systemFonts].join(',');

/** Medidas del marco del shell (menú lateral) que comparten el menú y las notificaciones. */
export const layout = {
  /** Ancho del menú lateral colapsado (riel de iconos). */
  railWidth: '3.5rem',
  /** Ancho del menú lateral extendido (angosto; nunca más del 88 % de una pantalla pequeña). */
  sidebarWidth: 'min(14.5rem, 88vw)',
  /**
   * Variable CSS con el ancho ACTUAL del menú lateral (lo publica el menú). Las notificaciones la
   * leen para no taparlo, sin acoplarse a él. Sin menú (login) vale el riel.
   */
  sidebarInsetVar: '--shell-sidebar-inset',
} as const;
