/**
 * Versión de la aplicación.
 *
 * Sale de `package.json` (campo `version`) y Vite la inyecta al compilar (`define` en
 * `vite.config.ts`), así hay UNA sola fuente de verdad. Un hook de git la incrementa
 * automáticamente una vez por push (ver `scripts/bump-version.mjs`).
 */
export const APP_VERSION: string = __APP_VERSION__;

export const APP_TITLE = 'Sistema de inventario IA';

/** Créditos del pie de las pantallas de acceso: "Desarrollado por RRR - 2026 - V.0.0.1". */
export const APP_CREDITS = `Desarrollado por RRR - 2026 - V.${APP_VERSION}`;
