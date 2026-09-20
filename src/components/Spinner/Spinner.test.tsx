import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { Spinner } from './Spinner';

const renderSpinner = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Spinner />', () => {
  it('se anuncia como estado con la etiqueta por defecto', () => {
    renderSpinner(<Spinner />);

    expect(screen.getByRole('status')).toHaveTextContent('Cargando…');
  });

  it('permite una etiqueta personalizada y visible', () => {
    renderSpinner(<Spinner label="Restaurando sesión" showLabel />);

    expect(screen.getByText('Restaurando sesión')).toBeVisible();
  });
});
