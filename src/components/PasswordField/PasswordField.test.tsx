import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { PasswordField } from './PasswordField';

const renderField = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<PasswordField />', () => {
  it('oculta la contraseña por defecto', () => {
    renderField(<PasswordField label="Contraseña" />);

    expect(screen.getByLabelText('Contraseña')).toHaveAttribute('type', 'password');
  });

  it('alterna entre mostrar y ocultar con el botón del ojo', async () => {
    renderField(<PasswordField label="Contraseña" defaultValue="secreta123" />);
    const input = screen.getByLabelText('Contraseña');

    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(input).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: 'Ocultar contraseña' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );

    await userEvent.click(screen.getByRole('button', { name: 'Ocultar contraseña' }));
    expect(input).toHaveAttribute('type', 'password');
  });

  it('muestra el error y deshabilita el botón cuando el campo está deshabilitado', () => {
    renderField(<PasswordField label="Contraseña" error="Muy corta" disabled />);

    expect(screen.getByRole('alert')).toHaveTextContent('Muy corta');
    expect(screen.getByRole('button', { name: 'Mostrar contraseña' })).toBeDisabled();
  });
});
