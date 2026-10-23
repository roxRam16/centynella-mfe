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
 *
 * `react`/`react-dom` van con versión EXACTA (sin `^`) en el `package.json` de cada repo, no
 * solo aquí: `singleton:true` asume que ambos lados resuelven la MISMA versión instalada. Un
 * desfase de patch (ya pasó: 19.3.0 aquí vs 19.3.1 en el remote, por instalar en días distintos)
 * hace que un chunk de un lado llame hooks sobre el React del otro → "Invalid hook call" /
 * `useX` de `null` en pantalla, sin avisar en build ni en tests. Al subir React, sube la versión
 * exacta en TODOS los repos a la vez.
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
 * Lo que el SHELL le presta a los remotes (`centynella_shell/<módulo>`): el mismo sistema de
 * diseño, la misma sesión y el mismo cliente de API que usa cualquier pantalla del shell.
 * Cada módulo es un archivo "fachada" en `src/federation/sdk/` que decide exactamente qué se
 * expone — nunca se expone código suelto directo.
 *
 * Un remote nuevo declara este mismo nombre (`centynella_shell`) como su `remote` en Module
 * Federation, apuntando al `remoteEntry.js` del shell corriendo (ver README: "Integrar un
 * microfrontend standalone").
 */
export const FEDERATION_EXPOSES = {
  './theme': './src/federation/sdk/theme.ts',
  './components': './src/federation/sdk/components.ts',
  './hooks': './src/federation/sdk/hooks.ts',
  './services': './src/federation/sdk/services.ts',
  './utils': './src/federation/sdk/utils.ts',
  './providers': './src/federation/sdk/providers.ts',
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
