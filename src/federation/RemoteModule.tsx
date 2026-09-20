import { Suspense, lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';
import CircularProgress from '@mui/material/CircularProgress';
import type { RemoteDefinition } from './remoteRegistry';
import { RemoteErrorBoundary } from './RemoteErrorBoundary';

interface RemoteModuleProps {
  remote: Pick<RemoteDefinition, 'label' | 'loader'>;
}

type RemoteLoader = RemoteDefinition['loader'];

/**
 * Un único `lazy` por loader (memoización a nivel de módulo).
 * Si se creara en cada render, React remontaría el remote perdiendo su estado.
 */
const lazyRemotes = new WeakMap<RemoteLoader, LazyExoticComponent<ComponentType>>();

function getLazyRemote(loader: RemoteLoader): LazyExoticComponent<ComponentType> {
  let component = lazyRemotes.get(loader);
  if (!component) {
    component = lazy(loader);
    lazyRemotes.set(loader, component);
  }
  return component;
}

/**
 * Monta un microfrontend remoto con carga perezosa (Suspense) y aislamiento de
 * errores (ErrorBoundary). Es la única puerta por donde el shell renderiza remotes.
 */
export function RemoteModule({ remote }: RemoteModuleProps) {
  const Remote = getLazyRemote(remote.loader);

  return (
    <RemoteErrorBoundary name={remote.label}>
      <Suspense fallback={<CircularProgress aria-label={`Cargando ${remote.label}`} />}>
        {/* eslint-disable-next-line react-hooks/static-components -- `Remote` está cacheado por loader en `lazyRemotes`: no se recrea entre renders */}
        <Remote />
      </Suspense>
    </RemoteErrorBoundary>
  );
}
