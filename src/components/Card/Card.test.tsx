import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { elevation } from '@/theme/tokens';
import { Card } from './Card';

const renderCard = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Card />', () => {
  it('renderiza su contenido', () => {
    renderCard(<Card>Contenido</Card>);

    expect(screen.getByText('Contenido')).toBeInTheDocument();
  });

  it('aplica la sombra del nivel de elevación indicado', () => {
    renderCard(<Card elevation={2}>Sombra</Card>);

    expect(screen.getByText('Sombra')).toHaveStyle({ boxShadow: elevation[2] });
  });

  it('el nivel 0 es plano (sin sombra)', () => {
    renderCard(<Card elevation={0}>Plana</Card>);

    expect(screen.getByText('Plana')).toHaveStyle({ boxShadow: 'none' });
  });

  it('puede renderizarse como un elemento semántico', () => {
    renderCard(<Card as="section">Sección</Card>);

    expect(screen.getByText('Sección').tagName).toBe('SECTION');
  });
});
