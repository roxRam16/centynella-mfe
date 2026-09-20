import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme';
import * as healthService from '@/services/healthService';
import type { RemoteDefinition } from '@/federation';
import { AppRoutes } from './AppRoutes';

const inventoryRemote: RemoteDefinition = {
  id: 'inventory',
  label: 'Inventario',
  path: '/inventory',
  loader: async () => ({ default: () => <p>Remote de inventario</p> }),
};

const renderAt = (path: string, remotes: readonly RemoteDefinition[] = []) =>
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <AppRoutes remotes={remotes} />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('<AppRoutes />', () => {
  beforeEach(() => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renderiza el shell semántico con la página de inicio', () => {
    renderAt('/');

    expect(screen.getByRole('banner')).toBeInTheDocument(); // <header>
    expect(screen.getByRole('navigation', { name: 'Principal' })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument(); // <footer>
    expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
  });

  it('muestra 404 en rutas desconocidas', () => {
    renderAt('/no-existe');
    expect(screen.getByRole('heading', { name: 'Página no encontrada' })).toBeInTheDocument();
  });

  it('monta un microfrontend registrado en su ruta y lo enlaza en la navegación', async () => {
    renderAt('/inventory', [inventoryRemote]);

    expect(await screen.findByText('Remote de inventario')).toBeInTheDocument();
  });
});
