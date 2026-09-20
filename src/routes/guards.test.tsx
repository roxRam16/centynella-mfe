import { screen } from '@testing-library/react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { makeProfile } from '@/test/factories';
import { renderWithProviders } from '@/test/renderWithProviders';
import { PublicOnly, RequireAuth, RequirePermission } from './guards';

function Where() {
  const location = useLocation();
  return (
    <p>
      en {location.pathname} state={JSON.stringify(location.state)}
    </p>
  );
}

const routes = (
  <Routes>
    <Route element={<PublicOnly />}>
      <Route path="/login" element={<p>pantalla login</p>} />
    </Route>
    <Route element={<RequireAuth />}>
      <Route index element={<p>inicio privado</p>} />
      <Route path="/reporte" element={<p>reporte privado</p>} />
      <Route element={<RequirePermission permission="users:read" />}>
        <Route path="/admin" element={<p>zona admin</p>} />
      </Route>
    </Route>
    <Route path="*" element={<Where />} />
  </Routes>
);

describe('RequireAuth', () => {
  it('muestra un indicador mientras se restaura la sesión (no parpadea el login)', () => {
    renderWithProviders(routes, { route: '/', auth: { status: 'loading', user: null } });

    expect(screen.getByRole('status')).toHaveTextContent('Restaurando tu sesión…');
    expect(screen.queryByText('pantalla login')).not.toBeInTheDocument();
  });

  it('redirige a /login cuando no hay sesión', () => {
    renderWithProviders(routes, { route: '/reporte', auth: { user: null } });

    expect(screen.getByText('pantalla login')).toBeInTheDocument();
  });

  it('deja pasar a quien tiene sesión', () => {
    renderWithProviders(routes, { route: '/reporte' });

    expect(screen.getByText('reporte privado')).toBeInTheDocument();
  });
});

describe('PublicOnly', () => {
  it('lleva al inicio a quien ya inició sesión', () => {
    renderWithProviders(routes, { route: '/login' });

    expect(screen.getByText('inicio privado')).toBeInTheDocument();
  });

  it('respeta la página de origen guardada en el estado', () => {
    renderWithProviders(routes, { route: { pathname: '/login', state: { from: '/reporte' } } });

    expect(screen.getByText('reporte privado')).toBeInTheDocument();
  });

  it('muestra el login a los visitantes', () => {
    renderWithProviders(routes, { route: '/login', auth: { user: null } });

    expect(screen.getByText('pantalla login')).toBeInTheDocument();
  });

  it('muestra un indicador mientras carga la sesión', () => {
    renderWithProviders(routes, { route: '/login', auth: { status: 'loading', user: null } });

    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

describe('RequirePermission', () => {
  it('permite el acceso con el permiso', () => {
    renderWithProviders(routes, { route: '/admin' });

    expect(screen.getByText('zona admin')).toBeInTheDocument();
  });

  it('muestra 403 (conservando la URL) sin el permiso', () => {
    renderWithProviders(routes, {
      route: '/admin',
      auth: { user: makeProfile({ permissions: [] }) },
    });

    expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    expect(screen.queryByText('zona admin')).not.toBeInTheDocument();
  });
});
