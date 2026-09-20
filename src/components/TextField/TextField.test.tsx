import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { TextField } from './TextField';

const renderField = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<TextField />', () => {
  it('asocia la etiqueta con el campo y permite escribir', async () => {
    renderField(<TextField label="Correo electrónico" />);

    const input = screen.getByLabelText('Correo electrónico');
    await userEvent.type(input, 'ana@example.com');

    expect(input).toHaveValue('ana@example.com');
  });

  it('muestra el texto de ayuda enlazado con aria-describedby', () => {
    renderField(<TextField label="Nombre" helperText="Como aparece en tu documento" />);

    const input = screen.getByLabelText('Nombre');
    expect(input).toHaveAccessibleDescription('Como aparece en tu documento');
    expect(input).not.toHaveAttribute('aria-invalid');
  });

  it('en error marca aria-invalid y anuncia el mensaje', () => {
    renderField(<TextField label="Nombre" error="Es obligatorio" helperText="ignorado" />);

    expect(screen.getByLabelText('Nombre')).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Es obligatorio');
  });

  it('reenvía los atributos nativos y la ref al input', () => {
    const ref = createRef<HTMLInputElement>();
    renderField(
      <TextField label="Nombre" ref={ref} placeholder="Tu nombre" autoComplete="name" required />,
    );

    expect(ref.current).toBe(screen.getByPlaceholderText('Tu nombre'));
    expect(ref.current).toHaveAttribute('autocomplete', 'name');
    expect(ref.current).toBeRequired();
  });

  it('puede deshabilitarse', () => {
    renderField(<TextField label="Nombre" disabled />);

    expect(screen.getByLabelText('Nombre')).toBeDisabled();
  });
});
