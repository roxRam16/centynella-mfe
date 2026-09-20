/**
 * Utilidades de color para verificar accesibilidad (WCAG 2.x).
 * Se usan en las pruebas del tema para que la teoría del color
 * quede respaldada por números y no solo por criterio visual.
 */

/** Convierte `#rrggbb` a sus canales [r, g, b] en 0-255. */
export function hexToRgb(hex: string): [number, number, number] {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) {
    throw new Error(`Color hexadecimal inválido: "${hex}"`);
  }
  const value = parseInt(match[1], 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

/** Luminancia relativa según la definición de WCAG. */
export function relativeLuminance(hex: string): number {
  const [r, g, b] = hexToRgb(hex).map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Relación de contraste entre dos colores (1 a 21).
 * AA texto normal ≥ 4.5 · AA texto grande / componentes UI ≥ 3.
 */
export function contrastRatio(foreground: string, background: string): number {
  const [lighter, darker] = [relativeLuminance(foreground), relativeLuminance(background)].sort(
    (a, b) => b - a,
  );
  return (lighter + 0.05) / (darker + 0.05);
}
