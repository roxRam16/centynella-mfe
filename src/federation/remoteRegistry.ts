import type { ComponentType } from 'react';

/**
 * Contrato entre el shell y un microfrontend remoto.
 * El remote debe exponer (`exposes`) un módulo con un componente React como `default`.
 */
export interface RemoteDefinition {
  /** Identificador único; también se usa como clave de React. */
  id: string;
  /** Texto de la navegación. */
  label: string;
  /** Ruta del shell donde se monta (p. ej. `/inventory`). El remote maneja sus subrutas (`/*`). */
  path: string;
  /** Carga perezosa del módulo expuesto por el remote. */
  loader: () => Promise<{ default: ComponentType }>;
}

/**
 * Registro de microfrontends (patrón Registry): el shell construye su navegación y
 * sus rutas a partir de esta lista, sin conocer a cada remote.
 *
 * Para integrar un standalone nuevo (ejemplo real: `centynella-clientes`):
 *  1. Añadir `nombreFederacion@urlRemoteEntry` a `VITE_REMOTES` (private/.env.*). `nombreFederacion`
 *     DEBE ser idéntico al `FEDERATION_NAME` que el remote declara en su propio `federation.config.ts`
 *     (federación nativa por módulos: el nombre es la clave global con la que se resuelve, no un
 *     alias libre del shell).
 *  2. Declarar su `./App` en `src/federation/remotes.d.ts`.
 *  3. Registrar aquí (el `id`/`label`/`path` sí son libres, son solo del shell):
 *
 *     {
 *       id: 'clientes',
 *       label: 'Clientes',
 *       path: '/clientes',
 *       loader: () => import('centynella_clientes/App'),
 *     },
 */
export const remoteRegistry: readonly RemoteDefinition[] = [
  {
    id: 'clientes',
    label: 'Clientes',
    path: '/clientes',
    loader: () => import('centynella_clientes/App'),
  },
];
