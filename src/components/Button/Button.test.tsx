import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Button } from './Button';
import { resolveButtonRadius } from './radius';

const renderButton = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Button />', () => {
  it('renderiza el texto y responde al clic', async () => {
    const onClick = vi.fn();
    renderButton(<Button onClick={onClick}>Guardar</Button>);

    await userEvent.click(screen.getByRole('button', { name: 'Guardar' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('aplica la variante primary por defecto (contained)', () => {
    renderButton(<Button>Guardar</Button>);
    expect(screen.getByRole('button')).toHaveClass('MuiButton-contained', 'MuiButton-colorPrimary');
  });

  it.each([
    ['secondary', 'MuiButton-contained', 'MuiButton-colorSecondary'],
    ['outlined', 'MuiButton-outlined', 'MuiButton-colorPrimary'],
    ['text', 'MuiButton-text', 'MuiButton-colorPrimary'],
  ] as const)('mapea la variante %s', (variant, variantClass, colorClass) => {
    renderButton(<Button variant={variant}>Acción</Button>);
    expect(screen.getByRole('button')).toHaveClass(variantClass, colorClass);
  });

  it('el radio depende de la variante y la forma', () => {
    expect(resolveButtonRadius('primary', 'pill')).toBe(9999);
    expect(resolveButtonRadius('primary', 'rounded')).toBe(4);
    expect(resolveButtonRadius('text', 'pill')).toBe(4); // el "text link" nunca es píldora
  });

  it('acepta sx del llamador sin romperse', () => {
    renderButton(<Button sx={{ alignSelf: 'flex-start' }}>Guardar</Button>);

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });

  it('la acción destructiva usa el color de error', () => {
    renderButton(<Button danger>Eliminar</Button>);

    expect(screen.getByRole('button')).toHaveClass('MuiButton-colorError');
  });

  it('no dispara clic cuando está cargando', async () => {
    const onClick = vi.fn();
    renderButton(
      <Button loading onClick={onClick}>
        Enviar
      </Button>,
    );

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    // MUI aplica pointer-events:none al estado loading; se omite esa verificación para intentar el clic igualmente.
    await userEvent.setup({ pointerEventsCheck: 0 }).click(button);
    expect(onClick).not.toHaveBeenCalled();
  });
});
