import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@/theme';
import { PasswordRequirements } from './PasswordRequirements';

const renderRequirements = (password: string) =>
  render(
    <ThemeProvider>
      <PasswordRequirements password={password} />
    </ThemeProvider>,
  );

/** El <li> de un requisito por su texto. */
const item = (label: string) =>
  within(screen.getByRole('list', { name: 'Requisitos de la contraseña' }))
    .getAllByRole('listitem')
    .find((li) => li.textContent?.startsWith(label))!;

describe('<PasswordRequirements />', () => {
  it('con la contraseña vacía casi todo está pendiente', () => {
    renderRequirements('');

    expect(item('Una mayúscula')).toHaveTextContent('— pendiente');
    expect(item('Al menos 8 caracteres')).toHaveTextContent('— pendiente');
    expect(item('Sin espacios')).toHaveTextContent('— cumplido'); // vacío no tiene espacios
    expect(screen.getAllByText(/— pendiente/)).toHaveLength(5);
  });

  it('marca cada requisito a medida que se cumple', () => {
    renderRequirements('Segura#123');

    expect(screen.queryByText(/— pendiente/)).not.toBeInTheDocument();
    expect(screen.getAllByText(/— cumplido/)).toHaveLength(6);
  });

  it('detecta lo que falta', () => {
    renderRequirements('segura123');

    expect(item('Una mayúscula')).toHaveTextContent('— pendiente');
    expect(item('Un símbolo')).toHaveTextContent('— pendiente');
    expect(item('Una minúscula')).toHaveTextContent('— cumplido');
  });
});
