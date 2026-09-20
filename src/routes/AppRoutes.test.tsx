import { screen } from '@testing-library/react';
import * as healthService from '@/services/healthService';
import type { RemoteDefinition } from '@/federation';
import { makeProfile } from '@/test/factories';
import { mockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AppRoutes } from './AppRoutes';

const inventoryRemote: RemoteDefinition = {
  id: 'inventory',
  label: 'Inventario',
  path: '/inventory',
  loader: async () => ({ default: () => <p>Remote de inventario</p> }),
};

const renderAt = (
  route: string,
  {
    remotes = [],
    auth,
  }: { remotes?: readonly RemoteDefinition[]; auth?: Record<string, unknown> } = {},
) => renderWithProviders(<AppRoutes remotes={remotes} />, { route, auth });

describe('<AppRoutes />', () => {
  beforeEach(() => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    mockApi({
      'GET /api/v1/users': () => ({ json: { items: [], total: 0, page: 1, page_size: 10 } }),
      'GET /api/v1/roles': () => ({ json: [] }),
      'GET /api/v1/permissions': () => ({ json: [] }),
      'GET /api/v1/logs': () => ({ json: { items: [], total: 0, page: 1, page_size: 25 } }),
      'GET /api/v1/logs/modules': () => ({ json: [] }),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  describe('con sesión', () => {
    it('renderiza el shell semántico con la página de inicio', () => {
      renderAt('/');

      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
      expect(screen.getByRole('main')).toBeInTheDocument();
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
      expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
    });

    it('muestra el 404 amable en rutas desconocidas', () => {
      renderAt('/no-existe');

      expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
      expect(screen.getByText('Error 404')).toBeInTheDocument();
    });

    it('la bitácora exige logs:read', async () => {
      renderAt('/admin/logs');
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Bitácora' }),
      ).toBeInTheDocument();
    });

    it('sin logs:read la bitácora muestra 403', () => {
      renderAt('/admin/logs', { auth: { user: makeProfile({ permissions: ['users:read'] }) } });

      expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    });

    it('/error/:code muestra la pantalla de cualquier código HTTP', () => {
      const { unmount } = renderAt('/error/503');
      expect(screen.getByRole('heading', { name: 'Estamos en mantenimiento' })).toBeInTheDocument();
      unmount();

      renderAt('/error/no-es-un-codigo');
      expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
    });

    it('monta un microfrontend registrado en su ruta y lo enlaza en la navegación', async () => {
      renderAt('/inventory', { remotes: [inventoryRemote] });

      expect(await screen.findByText('Remote de inventario')).toBeInTheDocument();
      expect(screen.getByRole('link', { name: 'Inventario' })).toHaveAttribute(
        'href',
        '/inventory',
      );
    });

    it('abre el perfil', () => {
      renderAt('/profile');

      expect(screen.getByRole('heading', { level: 1, name: 'Mi perfil' })).toBeInTheDocument();
    });

    it('un usuario que ya inició sesión no ve el login: va al inicio', () => {
      renderAt('/login');

      expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
    });

    it('la administración exige permiso: con él se ve, sin él aparece 403', async () => {
      const { unmount } = renderAt('/admin/users');
      expect(
        await screen.findByRole('heading', { level: 1, name: 'Usuarios' }),
      ).toBeInTheDocument();
      unmount();

      renderAt('/admin/users', { auth: { user: makeProfile({ permissions: [] }) } });
      expect(screen.getByRole('heading', { name: 'Acceso restringido' })).toBeInTheDocument();
    });

    it('la pantalla de roles exige roles:read', async () => {
      renderAt('/admin/roles');

      expect(
        await screen.findByRole('heading', { level: 1, name: 'Roles y permisos' }),
      ).toBeInTheDocument();
    });
  });

  describe('sin sesión', () => {
    it('una URL inexistente muestra el 404 (no redirige al login)', () => {
      renderAt('/ruta/que/no-existe', { auth: { user: null } });

      expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
      expect(screen.queryByRole('heading', { name: 'Bienvenido' })).not.toBeInTheDocument();
    });

    it('redirige cualquier ruta privada al login', () => {
      renderAt('/', { auth: { user: null } });

      expect(screen.getByRole('heading', { level: 1, name: 'Bienvenido' })).toBeInTheDocument();
    });

    it('muestra el registro y la recuperación de contraseña', () => {
      const { unmount } = renderAt('/register', { auth: { user: null } });
      expect(screen.getByRole('heading', { level: 1, name: 'Crear cuenta' })).toBeInTheDocument();
      unmount();

      renderAt('/forgot-password', { auth: { user: null } });
      expect(
        screen.getByRole('heading', { level: 1, name: 'Recuperar contraseña' }),
      ).toBeInTheDocument();
    });

    it('el enlace de recuperación funciona con o sin sesión', () => {
      renderAt('/reset-password?token=abc', { auth: { user: null } });

      expect(
        screen.getByRole('heading', { level: 1, name: 'Nueva contraseña' }),
      ).toBeInTheDocument();
    });
  });
});
