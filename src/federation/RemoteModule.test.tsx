import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { RemoteModule } from './RemoteModule';

const renderRemote = (loader: () => Promise<{ default: React.ComponentType }>) =>
  render(
    <ThemeProvider>
      <RemoteModule remote={{ label: 'Inventario', loader }} />
    </ThemeProvider>,
  );

describe('<RemoteModule />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el indicador de carga y luego el remote', async () => {
    renderRemote(async () => ({ default: () => <p>Módulo de inventario</p> }));

    expect(screen.getByRole('progressbar', { name: 'Cargando Inventario' })).toBeInTheDocument();
    expect(await screen.findByText('Módulo de inventario')).toBeInTheDocument();
  });

  it('aísla el fallo y muestra una alerta si el remote no carga', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    renderRemote(() => Promise.reject(new Error('remoteEntry no disponible')));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('No se pudo cargar "Inventario"');
  });
});
