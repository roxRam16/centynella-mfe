import { StatusPage } from './StatusPage';

/** Sesión válida pero sin permiso para esta sección: 403 integrado en el shell (se conserva el menú). */
export function ForbiddenPage() {
  return <StatusPage code={403} />;
}
