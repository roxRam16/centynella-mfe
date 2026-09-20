import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, Route, Routes } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import { AppErrorBoundary } from './AppErrorBoundary';

function Explota(): never {
  throw new Error('fallo al renderizar');
}

const renderApp = (Broken: () => React.ReactNode) =>
  renderWithProviders(
    <AppErrorBoundary>
      <nav>
        <Link to="/otra">Ir a otra</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Broken />} />
        <Route path="/otra" element={<p>página sana</p>} />
      </Routes>
    </AppErrorBoundary>,
  );

describe('<AppErrorBoundary />', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => vi.restoreAllMocks());

  it('un error al renderizar muestra la pantalla 500 en vez de una página en blanco', () => {
    renderApp(() => <Explota />);

    expect(screen.getByRole('heading', { name: 'Algo salió mal' })).toBeInTheDocument();
    expect(screen.getByText('Error 500')).toBeInTheDocument();
    expect(console.error).toHaveBeenCalledWith(
      '[app] Error inesperado al renderizar',
      expect.any(Error),
      expect.anything(),
    );
  });

  it('sin errores muestra la aplicación normal', () => {
    renderApp(() => <p>todo bien</p>);

    expect(screen.getByText('todo bien')).toBeInTheDocument();
  });

  it('Reintentar vuelve a renderizar (y muestra el error otra vez si persiste)', async () => {
    let fails = true;
    renderApp(() => (fails ? <Explota /> : <p>recuperado</p>));

    fails = false;
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(screen.getByText('recuperado')).toBeInTheDocument();
  });
});
