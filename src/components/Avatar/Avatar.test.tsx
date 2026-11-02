import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { Avatar } from './Avatar';

describe('<Avatar />', () => {
  it('muestra las iniciales y expone el nombre como etiqueta accesible', () => {
    render(
      <ThemeProvider>
        <Avatar name="Ana Pérez" />
      </ThemeProvider>,
    );

    expect(screen.getByLabelText('Ana Pérez')).toHaveTextContent('AP');
  });

  it('con `src` muestra la foto en vez de las iniciales', () => {
    render(
      <ThemeProvider>
        <Avatar name="Refresco de cola" src="https://example.com/foto.jpg" />
      </ThemeProvider>,
    );

    const avatar = screen.getByLabelText('Refresco de cola');
    expect(avatar.querySelector('img')).toHaveAttribute('src', 'https://example.com/foto.jpg');
  });
});
