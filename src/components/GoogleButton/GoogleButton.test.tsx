import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { GoogleButton } from './GoogleButton';

const renderButton = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<GoogleButton />', () => {
  it('tiene nombre accesible y dispara onClick', async () => {
    const onClick = vi.fn();
    renderButton(<GoogleButton onClick={onClick} />);

    await userEvent.click(screen.getByRole('button', { name: 'Continuar con Google' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('deshabilitado no responde y avisa "Próximamente"', async () => {
    const onClick = vi.fn();
    renderButton(<GoogleButton onClick={onClick} disabled />);

    const button = screen.getByRole('button', { name: 'Continuar con Google' });
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);

    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('title', 'Próximamente');
    expect(onClick).not.toHaveBeenCalled();
  });
});
