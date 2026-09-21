import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EditIcon from '@mui/icons-material/EditOutlined';
import { ThemeProvider } from '@/theme';
import { IconButton } from './IconButton';

const renderButton = (props: Partial<React.ComponentProps<typeof IconButton>> = {}) =>
  render(
    <ThemeProvider>
      <IconButton label="Editar a Ana" icon={<EditIcon />} {...props} />
    </ThemeProvider>,
  );

describe('<IconButton />', () => {
  it('tiene nombre accesible aunque solo muestre un icono', () => {
    renderButton();

    expect(screen.getByRole('button', { name: 'Editar a Ana' })).toBeInTheDocument();
  });

  it('responde al clic', async () => {
    const onClick = vi.fn();
    renderButton({ onClick });

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Ana' }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('muestra el nombre como tooltip al pasar el cursor', async () => {
    renderButton();

    await userEvent.hover(screen.getByRole('button', { name: 'Editar a Ana' }));

    expect(await screen.findByRole('tooltip')).toHaveTextContent('Editar a Ana');
  });

  it('deshabilitado no dispara clic', async () => {
    const onClick = vi.fn();
    renderButton({ disabled: true, onClick });

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Ana' }), {
      pointerEventsCheck: 0,
    });

    expect(screen.getByRole('button', { name: 'Editar a Ana' })).toBeDisabled();
    expect(onClick).not.toHaveBeenCalled();
  });

  it.each(['default', 'primary', 'danger'] as const)('acepta el tono %s', (tone) => {
    renderButton({ tone });

    expect(screen.getByRole('button')).toBeInTheDocument();
  });
});
