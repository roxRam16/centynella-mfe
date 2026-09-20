import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import { makeProfile } from '@/test/factories';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AuthLayout } from './AuthLayout';
import { ShellLayout } from './ShellLayout';

const renderShell = (auth = {}) =>
  renderWithProviders(
    <Routes>
      <Route element={<ShellLayout />}>
        <Route index element={<p>contenido inicio</p>} />
        <Route path="/profile" element={<p>contenido perfil</p>} />
      </Route>
    </Routes>,
    { auth },
  );

describe('<ShellLayout />', () => {
  it('tiene la estructura semántica y un enlace para saltar al contenido', () => {
    renderShell();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('contenido inicio');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido-principal',
    );
  });

  it('el pie muestra el ambiente y la versión', () => {
    renderShell();

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      /ambiente sandbox · V\.\d+\.\d+\.\d+/,
    );
  });

  it('muestra los enlaces de administración según los permisos', () => {
    renderShell();

    expect(screen.getByRole('link', { name: 'Usuarios' })).toHaveAttribute('href', '/admin/users');
    expect(screen.getByRole('link', { name: 'Roles' })).toHaveAttribute('href', '/admin/roles');
    expect(screen.getByRole('link', { name: 'Bitácora' })).toHaveAttribute('href', '/admin/logs');
  });

  it('oculta los enlaces para quien no tiene los permisos', () => {
    renderShell({ user: makeProfile({ permissions: [] }) });

    expect(screen.getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Roles' })).not.toBeInTheDocument();
  });

  it('el menú de usuario lleva al perfil', async () => {
    renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Mi perfil' }));

    expect(await screen.findByText('contenido perfil')).toBeInTheDocument();
  });

  it('el menú de usuario cierra la sesión', async () => {
    const { auth } = renderShell();

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });
});

describe('<AuthLayout />', () => {
  it('muestra la ilustración y el contenido de la ruta dentro de la tarjeta', () => {
    renderWithProviders(
      <Routes>
        <Route element={<AuthLayout />}>
          <Route index element={<h1>Formulario de prueba</h1>} />
        </Route>
      </Routes>,
      { auth: { user: null } },
    );

    expect(screen.getByRole('main')).toContainElement(
      screen.getByRole('heading', { name: 'Formulario de prueba' }),
    );
    expect(
      screen.getByRole('img', { name: 'Ilustración de acceso seguro', hidden: true }),
    ).toBeInTheDocument();
  });
});
