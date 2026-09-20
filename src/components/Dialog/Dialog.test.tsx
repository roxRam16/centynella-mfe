import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { ConfirmDialog } from './ConfirmDialog';
import { Dialog } from './Dialog';

const renderUi = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Dialog />', () => {
  it('se rotula con su título y muestra el contenido', () => {
    renderUi(
      <Dialog open title="Nuevo usuario" onClose={() => {}}>
        Formulario
      </Dialog>,
    );

    expect(screen.getByRole('dialog', { name: 'Nuevo usuario' })).toBeInTheDocument();
    expect(screen.getByText('Formulario')).toBeInTheDocument();
  });

  it('no renderiza nada cerrado', () => {
    renderUi(
      <Dialog open={false} title="Oculto" onClose={() => {}}>
        x
      </Dialog>,
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('se cierra con la tecla Escape', async () => {
    const onClose = vi.fn();
    renderUi(
      <Dialog open title="Modal" onClose={onClose}>
        x
      </Dialog>,
    );

    await userEvent.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalled();
  });

  it('renderiza las acciones del pie', () => {
    renderUi(
      <Dialog
        open
        title="Modal"
        onClose={() => {}}
        actions={<button type="button">Guardar</button>}
      >
        x
      </Dialog>,
    );

    expect(screen.getByRole('button', { name: 'Guardar' })).toBeInTheDocument();
  });
});

describe('<ConfirmDialog />', () => {
  const baseProps = { open: true, title: 'Eliminar', message: '¿Seguro?' };

  it('confirma y cancela', async () => {
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderUi(
      <ConfirmDialog
        {...baseProps}
        confirmLabel="Eliminar"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar' }));
    await userEvent.click(screen.getByRole('button', { name: 'Cancelar' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('mientras carga no permite cancelar', () => {
    renderUi(<ConfirmDialog {...baseProps} loading onConfirm={() => {}} onCancel={() => {}} />);

    expect(screen.getByRole('button', { name: 'Cancelar' })).toBeDisabled();
  });
});
