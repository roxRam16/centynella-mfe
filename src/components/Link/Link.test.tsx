import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@/theme';
import { Link } from './Link';

const renderLink = (ui: React.ReactElement) =>
  render(
    <ThemeProvider>
      <MemoryRouter>{ui}</MemoryRouter>
    </ThemeProvider>,
  );

describe('<Link />', () => {
  it('enlaza una ruta interna sin recargar la página', () => {
    renderLink(<Link to="/register">Registrarse</Link>);

    expect(screen.getByRole('link', { name: 'Registrarse' })).toHaveAttribute('href', '/register');
  });

  it('abre los enlaces externos de forma segura', () => {
    renderLink(<Link href="https://example.com">Ayuda</Link>);

    const link = screen.getByRole('link', { name: 'Ayuda' });
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
