import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Route, Routes, useLocation } from 'react-router-dom';
import { renderWithProviders } from '@/test/renderWithProviders';
import { StatusPage } from './StatusPage';
import { STATUS_CATALOG, getStatusInfo, isErrorStatus } from './statusCatalog';

function Where() {
  return <p>en {useLocation().pathname}</p>;
}

const renderStatus = (props: React.ComponentProps<typeof StatusPage>) =>
  renderWithProviders(
    <Routes>
      <Route path="/" element={<StatusPage {...props} />} />
      <Route path="*" element={<Where />} />
    </Routes>,
  );

describe('statusCatalog', () => {
  it('cubre los códigos habituales con mensajes en español', () => {
    for (const code of [400, 401, 402, 403, 404, 408, 429, 500, 502, 503, 504]) {
      expect(STATUS_CATALOG[code].title).toBeTruthy();
      expect(STATUS_CATALOG[code].message.length).toBeGreaterThan(10);
    }
  });

  it('los códigos no catalogados usan un mensaje genérico según su clase', () => {
    expect(getStatusInfo(418).title).toBe('No se pudo completar la solicitud');
    expect(getStatusInfo(599).title).toBe('Error del servidor');
    expect(getStatusInfo(599).retry).toBe(true);
  });

  it.each([
    [404, true],
    [599, true],
    [200, false],
    [600, false],
    [404.5, false],
    [Number.NaN, false],
  ])('isErrorStatus(%s) → %s', (code, expected) => {
    expect(isErrorStatus(code)).toBe(expected);
  });
});

describe('<StatusPage />', () => {
  it('muestra el código, un título como h1 y una explicación clara', () => {
    renderStatus({ code: 404 });

    expect(
      screen.getByRole('heading', { level: 1, name: 'Página no encontrada' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/no existe o fue movida/)).toBeInTheDocument();
    expect(screen.getByText('Error 404')).toBeInTheDocument();
  });

  it('ofrece volver al inicio', async () => {
    renderWithProviders(
      <Routes>
        <Route path="/atras" element={<StatusPage code={404} />} />
        <Route path="/" element={<Where />} />
      </Routes>,
      { route: '/atras' },
    );

    await userEvent.click(screen.getByRole('button', { name: 'Volver al inicio' }));

    expect(screen.getByText('en /')).toBeInTheDocument();
  });

  it('el 401 lleva a iniciar sesión', async () => {
    renderStatus({ code: 401 });

    await userEvent.click(screen.getByRole('button', { name: 'Ir a iniciar sesión' }));

    expect(screen.getByText('en /login')).toBeInTheDocument();
  });

  it('los fallos temporales ofrecen Reintentar y usan la acción indicada', async () => {
    const onRetry = vi.fn();
    renderStatus({ code: 503, onRetry });

    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('los errores definitivos no ofrecen Reintentar', () => {
    renderStatus({ code: 403 });

    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument();
  });

  it('a pantalla completa incluye el logo y el fondo de marca', () => {
    renderStatus({ code: 500, fullPage: true });

    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'CENTYNELLA' })).toBeInTheDocument();
  });

  it('integrado en el shell no crea otro <main>', () => {
    renderStatus({ code: 403 });

    expect(screen.queryByRole('main')).not.toBeInTheDocument();
  });

  it('muestra el detalle técnico para poder reportar el problema', () => {
    renderStatus({ code: 500, detail: 'ref abc123' });

    expect(screen.getByText('Error 500 · ref abc123')).toBeInTheDocument();
  });
});
