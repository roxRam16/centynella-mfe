import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Tabs } from './Tabs';

const items = [
  { id: 'data', label: 'Datos', content: <p>Panel de datos</p> },
  { id: 'security', label: 'Seguridad', content: <p>Panel de seguridad</p> },
];

const renderTabs = (props: Partial<React.ComponentProps<typeof Tabs>> = {}) =>
  render(
    <ThemeProvider>
      <Tabs items={items} ariaLabel="Secciones del perfil" {...props} />
    </ThemeProvider>,
  );

describe('<Tabs />', () => {
  it('muestra la primera pestaña por defecto', () => {
    renderTabs();

    expect(screen.getByRole('tab', { name: 'Datos', selected: true })).toBeInTheDocument();
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel de datos');
  });

  it('cambia de panel al elegir otra pestaña', async () => {
    renderTabs();

    await userEvent.click(screen.getByRole('tab', { name: 'Seguridad' }));

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel de seguridad');
    expect(screen.queryByText('Panel de datos')).not.toBeInTheDocument();
  });

  it('enlaza cada pestaña con su panel mediante ARIA', () => {
    renderTabs();

    const tab = screen.getByRole('tab', { name: 'Datos' });
    const panel = screen.getByRole('tabpanel');
    expect(tab).toHaveAttribute('aria-controls', panel.id);
    expect(panel).toHaveAttribute('aria-labelledby', tab.id);
  });

  it('respeta la pestaña inicial indicada', () => {
    renderTabs({ defaultId: 'security' });

    expect(screen.getByRole('tabpanel')).toHaveTextContent('Panel de seguridad');
  });

  it('navega con las flechas del teclado', async () => {
    renderTabs();

    screen.getByRole('tab', { name: 'Datos' }).focus();
    await userEvent.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: 'Seguridad' })).toHaveFocus();
  });
});
