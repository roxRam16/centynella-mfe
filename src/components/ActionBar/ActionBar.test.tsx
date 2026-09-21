import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { ActionBar } from './ActionBar';
import type { ActionBarProps } from './ActionBar';

const renderBar = (props: ActionBarProps = {}) =>
  render(
    <ThemeProvider>
      <ActionBar {...props} />
    </ThemeProvider>,
  );

describe('<ActionBar />', () => {
  it('es una barra de herramientas y solo dibuja lo que se configura', () => {
    renderBar({ onRefresh: vi.fn() });

    expect(screen.getByRole('toolbar', { name: 'Acciones del módulo' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actualizar' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Nuevo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Filtros avanzados/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Acciones' })).not.toBeInTheDocument();
  });

  it('el botón nuevo usa el nombre indicado', async () => {
    const onNew = vi.fn();
    renderBar({ onNew, newLabel: 'Nuevo usuario' });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));

    expect(onNew).toHaveBeenCalledTimes(1);
  });

  it('actualizar avisa al módulo', async () => {
    const onRefresh = vi.fn();
    renderBar({ onRefresh });

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('el filtro es un interruptor con estado y cuenta de filtros aplicados', async () => {
    const onToggle = vi.fn();
    const { rerender } = renderBar({ filter: { open: false, count: 0, onToggle } });

    const button = screen.getByRole('button', { name: 'Filtros avanzados' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    await userEvent.click(button);
    expect(onToggle).toHaveBeenCalledTimes(1);

    rerender(
      <ThemeProvider>
        <ActionBar filter={{ open: true, count: 2, onToggle }} />
      </ThemeProvider>,
    );
    expect(screen.getByRole('button', { name: 'Filtros avanzados (2 aplicados)' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  it('el menú Acciones ofrece sus opciones y ejecuta la elegida', async () => {
    const onCards = vi.fn();
    renderBar({
      actions: [
        { label: 'Ver como tabla', checked: true, onClick: vi.fn() },
        { label: 'Ver como tarjetas', checked: false, onClick: onCards },
      ],
    });

    await userEvent.click(screen.getByRole('button', { name: 'Acciones' }));
    expect(screen.getByRole('menuitemradio', { name: 'Ver como tabla' })).toHaveAttribute(
      'aria-checked',
      'true',
    );
    await userEvent.click(screen.getByRole('menuitemradio', { name: 'Ver como tarjetas' }));

    expect(onCards).toHaveBeenCalledTimes(1);
  });
});
