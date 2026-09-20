import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme';
import * as healthService from '@/services/healthService';
import { HomePage } from './HomePage';

const renderPage = () =>
  render(
    <ThemeProvider>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </ThemeProvider>,
  );

describe('<HomePage />', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('muestra el Hola Mundo como encabezado principal', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: '¡Hola Mundo!' })).toBeInTheDocument();
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

  it('informa que aún no hay microfrontends registrados', () => {
    vi.spyOn(healthService, 'getHealth').mockReturnValue(new Promise(() => {}));
    renderPage();
    expect(screen.getByText('Aún no hay microfrontends registrados.')).toBeInTheDocument();
  });
});
