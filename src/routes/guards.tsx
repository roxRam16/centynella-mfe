import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Spinner } from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { ForbiddenPage } from '@/pages/ForbiddenPage';

/** Estado que se pasa al login para volver a la página que se intentaba abrir. */
export interface RedirectState {
  from?: string;
}

/**
 * Exige sesión iniciada. Mientras se restaura la sesión muestra un indicador (no parpadea
 * el login); sin sesión redirige a `/login` recordando a dónde quería ir.
 */
export function RequireAuth() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner fullPage label="Restaurando tu sesión…" showLabel />;
  if (status === 'anonymous') {
    const state: RedirectState = { from: location.pathname + location.search };
    return <Navigate to="/login" state={state} replace />;
  }
  return <Outlet />;
}

/** Solo para visitantes (login, registro): quien ya inició sesión va a la página que quería. */
export function PublicOnly() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === 'loading') return <Spinner fullPage label="Cargando…" showLabel />;
  if (status === 'authenticated') {
    const from = (location.state as RedirectState | null)?.from;
    return <Navigate to={from ?? '/'} replace />;
  }
  return <Outlet />;
}

interface RequirePermissionProps {
  /** Se exige este permiso (`recurso:acción`). */
  permission: string;
}

/**
 * Exige un permiso. Si falta muestra la página 403 conservando la URL.
 * Ocultar un enlace NO es seguridad: el backend valida cada petición; esto solo mejora la UX.
 */
export function RequirePermission({ permission }: RequirePermissionProps) {
  const { hasPermission } = useAuth();
  return hasPermission(permission) ? <Outlet /> : <ForbiddenPage />;
}
