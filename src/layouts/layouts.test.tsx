import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes } from 'react-router-dom';
import type { RemoteDefinition } from '@/federation';
import { palette } from '@/theme/palette';
import { makeProfile } from '@/test/factories';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AuthLayout } from './AuthLayout';
import { ShellLayout } from './ShellLayout';

const inventory: RemoteDefinition = {
  id: 'inventory',
  label: 'Inventario',
  path: '/inventory',
  loader: async () => ({ default: () => null }),
};

const renderShell = (
  options: {
    auth?: Record<string, unknown>;
    remotes?: readonly RemoteDefinition[];
    route?: string;
  } = {},
) =>
  renderWithProviders(
    <Routes>
      <Route element={<ShellLayout remotes={options.remotes} />}>
        <Route index element={<p>contenido inicio</p>} />
        <Route path="/profile" element={<p>contenido perfil</p>} />
        <Route path="/admin/users" element={<p>contenido usuarios</p>} />
      </Route>
    </Routes>,
    { auth: options.auth, route: options.route },
  );

const openMenu = () => userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));

describe('<ShellLayout /> — encabezado', () => {
  it('tiene la estructura semántica y un enlace para saltar al contenido', () => {
    renderShell();

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toHaveTextContent('contenido inicio');
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Saltar al contenido' })).toHaveAttribute(
      'href',
      '#contenido-principal',
    );
  });

  it('usa el degradado de marca (Blue → Violet), no un azul sólido', () => {
    renderShell();

    const header = screen.getByRole('banner');
    expect(getComputedStyle(header).backgroundImage).toContain('linear-gradient');
    expect(palette.header.gradient).toContain('#2D28F3');
    expect(palette.header.gradient).toContain('#7D58E0');
  });

  it('el pie muestra el ambiente y la versión', () => {
    renderShell();

    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      /ambiente sandbox · V\.\d+\.\d+\.\d+/,
    );
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

describe('<ShellLayout /> — menú lateral (riel + extendido)', () => {
  const menu = () => screen.getByRole('complementary', { name: 'Menú principal' });

  it('al cargar es un riel de iconos: sin textos, pero con nombres accesibles', () => {
    renderShell();

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    // Las opciones existen (por icono) y se nombran con aria-label; no se ven textos ni versión.
    expect(within(menu()).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(within(menu()).queryByText('Inicio')).not.toBeInTheDocument();
    expect(within(menu()).queryByText('SANDBOX')).not.toBeInTheDocument();
    expect(within(menu()).queryByText('Admin Principal')).not.toBeInTheDocument();
  });

  it('se extiende con el botón de menú y muestra usuario, textos, ambiente y versión', async () => {
    renderShell();

    await openMenu();

    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(menu()).getByText('Admin Principal')).toBeInTheDocument();
    expect(within(menu()).getByText('admin')).toBeInTheDocument();
    expect(within(menu()).getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(within(menu()).getByRole('link', { name: 'Inicio' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(menu()).getByText('SANDBOX')).toBeInTheDocument();
    expect(within(menu()).getByText(/^v\d+\.\d+\.\d+$/)).toBeInTheDocument();
  });

  it('empuja el contenido: el menú y el contenido son hermanos, no se superponen', async () => {
    renderShell();
    await openMenu();

    const main = screen.getByRole('main');
    expect(menu().contains(main)).toBe(false);
    expect(menu().parentElement).toBe(screen.getByRole('banner').parentElement?.parentElement);
  });

  it('se colapsa con la X', async () => {
    renderShell();
    await openMenu();

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar menú' }));

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(within(menu()).queryByText('SANDBOX')).not.toBeInTheDocument();
  });

  it('se colapsa con la tecla Escape', async () => {
    renderShell();
    await openMenu();

    await userEvent.keyboard('{Escape}');

    expect(screen.getByRole('button', { name: 'Abrir menú' })).toBeInTheDocument();
  });

  it('la administración es un grupo desplegable, cerrado hasta abrirlo', async () => {
    renderShell();
    await openMenu();

    const group = within(menu()).getByRole('button', { name: 'Administración' });
    expect(group).toHaveAttribute('aria-expanded', 'false');
    expect(within(menu()).queryByRole('link', { name: 'Usuarios' })).not.toBeInTheDocument();

    await userEvent.click(group);

    expect(group).toHaveAttribute('aria-expanded', 'true');
    expect(within(menu()).getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'href',
      '/admin/users',
    );
    expect(within(menu()).getByRole('link', { name: 'Roles y permisos' })).toHaveAttribute(
      'href',
      '/admin/roles',
    );
    expect(within(menu()).getByRole('link', { name: 'Bitácora' })).toHaveAttribute(
      'href',
      '/admin/logs',
    );
  });

  it('tocar el icono de un grupo en el riel extiende el menú con el grupo abierto', async () => {
    renderShell();

    await userEvent.click(within(menu()).getByRole('button', { name: 'Administración' }));

    expect(screen.getByRole('button', { name: 'Cerrar menú' })).toBeInTheDocument();
    expect(await within(menu()).findByRole('link', { name: 'Usuarios' })).toBeInTheDocument();
  });

  it('el grupo ya viene abierto cuando la página actual es una de sus opciones', async () => {
    renderShell({ route: '/admin/users' });
    await openMenu();

    expect(within(menu()).getByRole('button', { name: 'Administración' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    expect(within(menu()).getByRole('link', { name: 'Usuarios' })).toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('oculta la administración a quien no tiene permisos', () => {
    renderShell({ auth: { user: makeProfile({ permissions: [] }) } });

    expect(within(menu()).getByRole('link', { name: 'Inicio' })).toBeInTheDocument();
    expect(
      within(menu()).queryByRole('button', { name: 'Administración' }),
    ).not.toBeInTheDocument();
  });

  it('lista los microfrontends registrados', () => {
    renderShell({ remotes: [inventory] });

    expect(within(menu()).getByRole('link', { name: 'Inventario' })).toHaveAttribute(
      'href',
      '/inventory',
    );
  });

  it('Mi perfil navega desde el menú', async () => {
    renderShell();

    await userEvent.click(within(menu()).getByRole('link', { name: 'Mi perfil' }));

    expect(await screen.findByText('contenido perfil')).toBeInTheDocument();
  });

  it('Cerrar sesión del menú cierra la sesión', async () => {
    const { auth } = renderShell();

    await userEvent.click(within(menu()).getByRole('button', { name: 'Cerrar sesión' }));

    expect(auth.logout).toHaveBeenCalledTimes(1);
  });

  it('el fondo del menú es negro profundo (no #000 puro)', () => {
    renderShell();

    const panel = menu().firstElementChild as HTMLElement;
    expect(getComputedStyle(panel).backgroundColor).not.toBe('rgb(0, 0, 0)');
    expect(palette.sidebar.background).toBe('#0A0A12');
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
    expect(screen.getByRole('contentinfo')).toHaveTextContent(
      /^Desarrollado por RRR - 2026 - V\.\d+\.\d+\.\d+$/,
    );
    expect(
      screen.getByRole('img', { name: 'Ilustración de acceso seguro', hidden: true }),
    ).toBeInTheDocument();
  });
});

describe('<ShellLayout /> — ancho del menú para las notificaciones', () => {
  const inset = () => document.documentElement.style.getPropertyValue('--shell-sidebar-inset');

  it('publica el ancho del menú (riel → extendido) y lo retira al desmontar', async () => {
    const { unmount } = renderShell();
    expect(inset()).toBe('3.5rem');

    await openMenu();
    expect(inset()).toBe('min(14.5rem, 88vw)');

    unmount();
    expect(inset()).toBe('');
  });
});
