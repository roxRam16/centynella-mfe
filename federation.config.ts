/**
 * Configuración de Module Federation del SHELL (host).
 *
 * Vive en la raíz porque la consume `vite.config.ts` en tiempo de build.
 * Los remotes (microfrontends standalone) se declaran por variable de entorno
 * `VITE_REMOTES` para no tocar código al integrar uno nuevo.
 */

/** Nombre único del host dentro de la federación. */
export const FEDERATION_NAME = 'centynella_shell';

/** Descriptor de un remote tal como lo espera @module-federation/vite. */
export interface RemoteConfig {
  type: 'module';
  name: string;
  entry: string;
}

/**
 * Dependencias compartidas entre host y remotes.
 * `singleton` evita dos copias de React (rompería hooks y contexto).
 * Los remotes DEBEN declarar exactamente el mismo bloque.
 */
export const SHARED_DEPENDENCIES = {
  react: { singleton: true },
  'react-dom': { singleton: true },
  'react-router-dom': { singleton: true },
  '@mui/material': { singleton: true },
  '@emotion/react': { singleton: true },
  '@emotion/styled': { singleton: true },
} as const;

/**
 * Convierte `nombre@url,nombre@url` en la configuración de remotes.
 *
 * @param raw Valor crudo de `VITE_REMOTES` (puede venir vacío o indefinido).
 * @throws Error si una entrada no respeta el formato `nombre@url`.
 */
export function parseRemotes(raw: string | undefined): Record<string, RemoteConfig> {
  const remotes: Record<string, RemoteConfig> = {};
  const entries = (raw ?? '')
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  for (const entry of entries) {
    const separator = entry.indexOf('@');
    const name = entry.slice(0, separator).trim();
    const url = entry.slice(separator + 1).trim();

    if (separator <= 0 || !url) {
      throw new Error(`VITE_REMOTES inválido: "${entry}". Formato esperado: nombre@url`);
    }
    remotes[name] = { type: 'module', name, entry: url };
  }
  return remotes;
}
