import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemeProvider } from '@/theme';
import { SearchBar } from './SearchBar';

function Harness({ initial = '', children }: { initial?: string; children?: React.ReactNode }) {
  const [value, setValue] = useState(initial);
  return (
    <ThemeProvider>
      <SearchBar
        label="Buscar usuarios"
        placeholder="Nombre o correo"
        value={value}
        onChange={setValue}
      >
        {children}
      </SearchBar>
    </ThemeProvider>
  );
}

describe('<SearchBar />', () => {
  it('es una región de búsqueda con el campo nombrado', () => {
    render(<Harness />);

    expect(screen.getByRole('search')).toBeInTheDocument();
    expect(screen.getByRole('searchbox', { name: 'Buscar usuarios' })).toHaveAttribute(
      'placeholder',
      'Nombre o correo',
    );
  });

  it('avisa lo que se escribe', async () => {
    render(<Harness />);

    await userEvent.type(screen.getByRole('searchbox'), 'ana');

    expect(screen.getByRole('searchbox')).toHaveValue('ana');
  });

  it('el botón de limpiar solo aparece con texto y lo borra', async () => {
    render(<Harness />);
    expect(screen.queryByRole('button', { name: 'Limpiar búsqueda' })).not.toBeInTheDocument();

    await userEvent.type(screen.getByRole('searchbox'), 'ana');
    await userEvent.click(screen.getByRole('button', { name: 'Limpiar búsqueda' }));

    expect(screen.getByRole('searchbox')).toHaveValue('');
  });

  it('limita la longitud del texto', () => {
    render(<Harness />);

    expect(screen.getByRole('searchbox')).toHaveAttribute('maxlength', '100');
  });

  it('muestra el contenido de la zona derecha', () => {
    render(<Harness>{<span>filtros rápidos</span>}</Harness>);

    expect(screen.getByText('filtros rápidos')).toBeInTheDocument();
  });
});
