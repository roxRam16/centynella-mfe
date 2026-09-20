import { Route, Routes } from 'react-router-dom';
import { RemoteModule, remoteRegistry } from '@/federation';
import type { RemoteDefinition } from '@/federation';
import { ShellLayout } from '@/layouts/ShellLayout';
import { HomePage, NotFoundPage } from '@/pages';

interface AppRoutesProps {
  /** Inyectable para pruebas; por defecto usa el registro real de microfrontends. */
  remotes?: readonly RemoteDefinition[];
}

/**
 * Rutas del shell. Las rutas de cada microfrontend se generan desde el registro
 * (`path/*` deja que el remote maneje sus propias subrutas).
 */
export function AppRoutes({ remotes = remoteRegistry }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<ShellLayout />}>
        <Route index element={<HomePage />} />
        {remotes.map((remote) => (
          <Route
            key={remote.id}
            path={`${remote.path}/*`}
            element={<RemoteModule remote={remote} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
