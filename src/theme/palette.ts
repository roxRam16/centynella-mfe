/**
 * Paleta de CENTYNELLA — decisiones de teoría del color.
 *
 * Esquema COMPLEMENTARIO + neutros (regla 60-30-10):
 *  · 60 % neutros  → slate (tinte azul frío, descansa la vista en pantallas de datos densas)
 *  · 30 % primary  → azul (hue ≈ 221°): confianza, estabilidad, orden — ideal para inventarios
 *  · 10 % accent   → naranja (hue ≈ 21°, complementario del azul): llama la atención
 *                    solo donde importa (acciones clave, alertas de stock).
 *
 * Colores semánticos (verde/ámbar/rojo/cian) = atributos PREATENTIVOS: el usuario
 * distingue el estado antes de leer. Nunca se usan solos: siempre van acompañados
 * de icono y texto (codificación redundante, accesible para daltonismo).
 *
 * Todos los pares texto/fondo cumplen WCAG AA (≥ 4.5:1); ver palette.test.ts.
 */

export const palette = {
  primary: { light: '#3b82f6', main: '#1d4ed8', dark: '#1e3a8a', contrastText: '#ffffff' },
  secondary: { light: '#f97316', main: '#c2410c', dark: '#7c2d12', contrastText: '#ffffff' },
  success: { light: '#22c55e', main: '#15803d', dark: '#14532d', contrastText: '#ffffff' },
  warning: { light: '#f59e0b', main: '#b45309', dark: '#78350f', contrastText: '#ffffff' },
  error: { light: '#ef4444', main: '#b91c1c', dark: '#7f1d1d', contrastText: '#ffffff' },
  info: { light: '#38bdf8', main: '#0369a1', dark: '#0c4a6e', contrastText: '#ffffff' },
  neutral: {
    background: '#f8fafc',
    surface: '#ffffff',
    divider: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
  },
} as const;

export type SemanticColor = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info';
