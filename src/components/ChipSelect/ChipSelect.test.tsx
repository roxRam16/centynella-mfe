import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemeProvider } from '@/theme';
import { ChipSelect } from './ChipSelect';

const OPTIONS = [
  { value: 'admin', label: 'Administrador' },
  { value: 'manager', label: 'Gerente' },
  { value: 'viewer', label: 'Consulta' },
];

function Harness({
  initial = 'viewer',
  onChange,
  ...rest
}: {
  initial?: string;
  onChange?: (value: string) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
}) {
  const [value, setValue] = useState(initial);
  return (
    <ThemeProvider>
      <ChipSelect
        label="Rol"
        options={OPTIONS}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange?.(next);
        }}
        {...rest}
      />
    </ThemeProvider>
  );
}

describe('<ChipSelect />', () => {
  it('es un grupo con leyenda y una opción por chip', () => {
    render(<Harness />);

    const group = screen.getByRole('group', { name: 'Rol' });
    expect(group).toBeInTheDocument();
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.getByRole('radio', { name: 'Consulta' })).toBeChecked();
  });

  it('elige otra opción con clic y avisa el valor', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.click(screen.getByText('Gerente'));

    expect(onChange).toHaveBeenCalledWith('manager');
    expect(screen.getByRole('radio', { name: 'Gerente' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Consulta' })).not.toBeChecked();
  });

  it('se maneja con las flechas del teclado', async () => {
    const onChange = vi.fn();
    render(<Harness initial="admin" onChange={onChange} />);

    screen.getByRole('radio', { name: 'Administrador' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(onChange).toHaveBeenLastCalledWith('manager');
  });

  it('la opción elegida lleva degradado y marca de verificación (no solo color)', () => {
    render(<Harness initial="manager" />);

    const chip = screen.getByRole('radio', { name: 'Gerente' }).nextElementSibling as HTMLElement;
    expect(getComputedStyle(chip).backgroundImage).toContain('linear-gradient');
    expect(chip.querySelector('svg')).toBeInTheDocument();

    const other = screen.getByRole('radio', { name: 'Consulta' }).nextElementSibling as HTMLElement;
    expect(other.querySelector('svg')).not.toBeInTheDocument();
  });

  it('muestra el error asociado al grupo', () => {
    render(<Harness error="Selecciona un rol" />);

    expect(screen.getByRole('alert')).toHaveTextContent('Selecciona un rol');
    expect(screen.getByRole('group', { name: 'Rol' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('muestra el texto de ayuda', () => {
    render(<Harness helperText="Define los permisos" />);

    expect(screen.getByText('Define los permisos')).toBeInTheDocument();
  });

  it('deshabilitado no permite cambiar', async () => {
    const onChange = vi.fn();
    render(<Harness disabled onChange={onChange} />);

    await userEvent.click(screen.getByText('Gerente'));

    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('radio', { name: 'Gerente' })).toBeDisabled();
  });
});
