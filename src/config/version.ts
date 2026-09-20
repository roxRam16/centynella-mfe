/**
 * Versión de la aplicación.
 *
 * Sale de `package.json` (campo `version`) y Vite la inyecta al compilar (`define` en
 * `vite.config.ts`), así hay UNA sola fuente de verdad. Un hook de git la incrementa
 * automáticamente una vez por push (ver `scripts/bump-version.mjs`).
 */
export const APP_VERSION: string = __APP_VERSION__;

export const APP_TITLE = 'Sistema de inventario IA 2025';

/** Texto que se muestra en el login y en el pie: "Sistema de inventario IA 2025 - V.0.0.1". */
export const APP_LABEL = `${APP_TITLE} - V.${APP_VERSION}`;
