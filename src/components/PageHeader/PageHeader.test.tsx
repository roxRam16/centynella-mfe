import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { PageHeader } from './PageHeader';

const renderHeader = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<PageHeader />', () => {
  it('muestra el título como h1 y la descripción', () => {
    renderHeader(<PageHeader title="Usuarios" description="Administra las cuentas" />);

    expect(screen.getByRole('heading', { level: 1, name: 'Usuarios' })).toBeInTheDocument();
    expect(screen.getByText('Administra las cuentas')).toBeInTheDocument();
  });

  it('renderiza las acciones', () => {
    renderHeader(<PageHeader title="Usuarios" actions={<button type="button">Nuevo</button>} />);

    expect(screen.getByRole('button', { name: 'Nuevo' })).toBeInTheDocument();
  });
});
