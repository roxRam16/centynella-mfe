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
 * Para integrar un standalone nuevo:
 *  1. Añadir `nombre@urlRemoteEntry` a `VITE_REMOTES` (private/.env.*).
 *  2. Declarar el módulo en TypeScript: `declare module 'inventory/App';`
 *  3. Registrar aquí:
 *
 *     {
 *       id: 'inventory',
 *       label: 'Inventario',
 *       path: '/inventory',
 *       loader: () => import('inventory/App'),
 *     },
 *
 * Aún no hay microfrontends standalone: la lista empieza vacía.
 */
export const remoteRegistry: readonly RemoteDefinition[] = [];
