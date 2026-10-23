/**
 * Tipos de los microfrontends standalone que el shell consume (`VITE_REMOTES` +
 * `remoteRegistry.ts`). Module Federation no comparte tipos en tiempo de ejecución
 * (`dts: false` en ambos `vite.config.ts`): esto es un contrato manual, uno por remote.
 */

declare module 'centynella_clientes/App' {
  import type { ComponentType } from 'react';
  const App: ComponentType;
  export default App;
}
