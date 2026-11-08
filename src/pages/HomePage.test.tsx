import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as healthService from '@/services/healthService';
import { makeProfile } from '@/test/factories';
import { renderWithProviders } from '@/test/renderWithProviders';
import { HomePage } from './HomePage';

const renderPage = (options?: Parameters<typeof renderWithProviders>[1]) =>
  renderWithProviders(<HomePage />, options);

describe('<HomePage />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el Hola Mundo como encabezado principal y quién inició sesión', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
    expect(screen.getByText('Admin Principal')).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /consultando/i })).toBeInTheDocument();
  });

  it('indica que el backend está en línea', async () => {
    vi.spyOn(healthService, 'getHealth').mockResolvedValue({
      status: 'ok',
      service: 'centynella-core',
      version: '0.1.0',
      timestamp: '2026-09-19T00:00:00Z',
    });
    renderPage();

    expect(await screen.findByText('CENTYNELLA-CORE en línea')).toBeInTheDocument();
    expect(screen.getByText(/centynella-core v0\.1\.0/)).toBeInTheDocument();
  });

  it('muestra el error y permite reintentar', async () => {
    const spy = vi
      .spyOn(healthService, 'getHealth')
      .mockRejectedValueOnce(new Error('Network down'))
      .mockResolvedValueOnce({
        status: 'ok',
        service: 'centynella-core',
        version: '0.1.0',
        timestamp: '',
      });
    renderPage();

    expect(await screen.findByText('Sin conexión con CENTYNELLA-CORE')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));
    expect(await screen.findByText('CENTYNELLA-CORE en línea')).toBeInTheDocument();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('muestra cuántos microfrontends hay registrados', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage();
    // `centynella-clientes` y `centynella-proveedores` ya son remotes reales
    // (ver `federation/remoteRegistry.ts`).
    expect(screen.getByText('2 microfrontend(s) registrado(s).')).toBeInTheDocument();
  });

  it('con todos los permisos ofrece accesos rápidos a Ventas e Inventario', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage();

    const quickActions = screen.getByRole('navigation', { name: 'Accesos rápidos' });
    expect(within(quickActions).getByText('Nueva venta')).toBeInTheDocument();
    expect(within(quickActions).getByText('Inventario')).toBeInTheDocument();
  });

  it('sin el permiso de ventas no ofrece el acceso rápido "Nueva venta"', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage({ auth: { user: makeProfile({ permissions: ['products:read'] }) } });

    const quickActions = screen.getByRole('navigation', { name: 'Accesos rápidos' });
    expect(within(quickActions).queryByText('Nueva venta')).not.toBeInTheDocument();
    expect(within(quickActions).getByText('Inventario')).toBeInTheDocument();
  });
});
