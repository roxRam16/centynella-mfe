import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { PageHeader } from './PageHeader';

const renderHeader = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<PageHeader />', () => {
  it('muestra el título como h1', () => {
    renderHeader(<PageHeader title="Usuarios" description="Administra las cuentas" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
  });

  it('la descripción está oculta hasta pulsar el icono "?"', async () => {
    renderHeader(<PageHeader title="Usuarios" description="Administra las cuentas" />);

    expect(screen.queryByText('Administra las cuentas')).not.toBeInTheDocument();
    const help = screen.getByRole('button', { name: 'Ver la descripción' });
    expect(help).toHaveAttribute('aria-expanded', 'false');

    await userEvent.click(help);

    expect(screen.getByText('Administra las cuentas')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ocultar la descripción' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );
  });

  it('un segundo clic vuelve a ocultar la descripción', async () => {
    renderHeader(<PageHeader title="Usuarios" description="Administra las cuentas" />);

    await userEvent.click(screen.getByRole('button', { name: 'Ver la descripción' }));
    await userEvent.click(screen.getByRole('button', { name: 'Ocultar la descripción' }));

    expect(screen.queryByText('Administra las cuentas')).not.toBeInTheDocument();
  });

  it('sin descripción no muestra el icono de ayuda', () => {
    renderHeader(<PageHeader title="Usuarios" />);

    expect(screen.queryByRole('button', { name: /descripción/ })).not.toBeInTheDocument();
  });

  it('renderiza las acciones', () => {
    renderHeader(<PageHeader title="Usuarios" actions={<button type="button">Nuevo</button>} />);

    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});
