import { Route, Routes } from 'react-router-dom';
import { RemoteModule, remoteRegistry } from '@/federation';
import type { RemoteDefinition } from '@/federation';
import { AuthLayout } from '@/layouts/AuthLayout';
import { ShellLayout } from '@/layouts/ShellLayout';
import { HomePage, NotFoundPage, ProfilePage } from '@/pages';
import { RolesPage, UsersPage } from '@/pages/admin';
import { ForgotPasswordPage, LoginPage, RegisterPage, ResetPasswordPage } from '@/pages/auth';
import { PERMISSIONS } from '@/services/types';
import { PublicOnly, RequireAuth, RequirePermission } from './guards';

interface AppRoutesProps {
  /** Inyectable para pruebas; por defecto usa el registro real de microfrontends. */
  remotes?: readonly RemoteDefinition[];
}

/**
 * Rutas del shell.
 *  · Públicas (solo visitantes): /login, /register, /forgot-password.
 *  · /reset-password es pública siempre (el enlace del correo debe funcionar con o sin sesión).
 *  · Privadas (`RequireAuth`): inicio, perfil, microfrontends y administración.
 *  · Administración exige permiso (`RequirePermission`); el backend lo valida en cada petición.
 * Las rutas de cada microfrontend se generan desde el registro (`path/*` deja que el remote
 * maneje sus propias subrutas) y quedan protegidas por sesión automáticamente.
 */
export function AppRoutes({ remotes = remoteRegistry }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route element={<PublicOnly />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<ShellLayout remotes={remotes} />}>
          <Route index element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage />} />
          {remotes.map((remote) => (
            <Route
              key={remote.id}
              path={`${remote.path}/*`}
              element={<RemoteModule remote={remote} />}
            />
          ))}
          <Route element={<RequirePermission permission={PERMISSIONS.USERS_READ} />}>
            <Route path="/admin/users" element={<UsersPage />} />
          </Route>
          <Route element={<RequirePermission permission={PERMISSIONS.ROLES_READ} />}>
            <Route path="/admin/roles" element={<RolesPage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
