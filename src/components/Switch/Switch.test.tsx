import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { ThemeProvider } from '@/theme';
import { Switch } from './Switch';

function Harness({ onChange }: { onChange?: (checked: boolean) => void }) {
  const [on, setOn] = useState(false);
  return (
    <ThemeProvider>
      <Switch
        checked={on}
        onChange={(event) => {
          setOn(event.target.checked);
          onChange?.(event.target.checked);
        }}
        label={on ? 'Activo' : 'Deshabilitado'}
      />
    </ThemeProvider>
  );
}

describe('<Switch />', () => {
  it('es un interruptor accesible con su etiqueta', () => {
    render(<Harness />);

    const control = screen.getByRole('switch', { name: 'Deshabilitado' });
    expect(control).not.toBeChecked();
  });

  it('cambia de estado con clic (en el control o en la etiqueta) y con teclado', async () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);

    await userEvent.click(screen.getByRole('switch'));
    expect(screen.getByRole('switch', { name: 'Activo' })).toBeChecked();

    await userEvent.click(screen.getByText('Activo'));
    expect(screen.getByRole('switch', { name: 'Deshabilitado' })).not.toBeChecked();

    screen.getByRole('switch').focus();
    await userEvent.keyboard(' ');
    expect(onChange).toHaveBeenLastCalledWith(true);
  });

  it('puede deshabilitarse', () => {
    render(
      <ThemeProvider>
        <Switch label="Bloqueado" checked disabled onChange={() => undefined} />
      </ThemeProvider>,
    );

    expect(screen.getByRole('switch', { name: 'Bloqueado' })).toBeDisabled();
  });
});
