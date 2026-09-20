import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { DropdownMenu } from './DropdownMenu';

const renderMenu = (onProfile = vi.fn(), onLogout = vi.fn()) =>
  render(
    <ThemeProvider>
      <DropdownMenu
        label="Menú de usuario"
        trigger="Ana"
        items={[
          { label: 'Mi perfil', onClick: onProfile },
          { label: 'Cerrar sesión', onClick: onLogout, danger: true },
        ]}
      />
    </ThemeProvider>,
  );

describe('<DropdownMenu />', () => {
  it('está cerrado al inicio y expone su estado con ARIA', () => {
    renderMenu();

    const button = screen.getByRole('button', { name: 'Menú de usuario' });
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('abre el menú y ejecuta la opción elegida cerrándolo', async () => {
    const onLogout = vi.fn();
    renderMenu(vi.fn(), onLogout);

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    expect(screen.getByRole('menu')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Cerrar sesión' }));

    expect(onLogout).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('menuitem', { name: 'Cerrar sesión' })).not.toBeInTheDocument();
  });

  it('se cierra con Escape sin ejecutar nada', async () => {
    const onProfile = vi.fn();
    renderMenu(onProfile);

    await userEvent.click(screen.getByRole('button', { name: 'Menú de usuario' }));
    await userEvent.keyboard('{Escape}');

    expect(onProfile).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: 'Menú de usuario' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });
});
