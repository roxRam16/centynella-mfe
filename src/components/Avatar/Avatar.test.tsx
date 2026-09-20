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
});
