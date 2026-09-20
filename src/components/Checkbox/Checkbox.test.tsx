import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Checkbox } from './Checkbox';

describe('<Checkbox />', () => {
  it('se activa al hacer clic en el texto de la etiqueta', async () => {
    const onChange = vi.fn();
    render(
      <ThemeProvider>
        <Checkbox label="Recordarme" onChange={onChange} />
      </ThemeProvider>,
    );

    await userEvent.click(screen.getByText('Recordarme'));

    expect(screen.getByRole('checkbox', { name: 'Recordarme' })).toBeChecked();
    expect(onChange).toHaveBeenCalledTimes(1);
  });

  it('respeta defaultChecked y disabled', () => {
    render(
      <ThemeProvider>
        <Checkbox label="Acepto" defaultChecked disabled />
      </ThemeProvider>,
    );

    const box = screen.getByRole('checkbox', { name: 'Acepto' });
    expect(box).toBeChecked();
    expect(box).toBeDisabled();
  });
});
