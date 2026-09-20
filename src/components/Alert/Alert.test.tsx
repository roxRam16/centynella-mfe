import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@/theme';
import { Alert } from './Alert';

const renderAlert = (ui: React.ReactElement) => render(<ThemeProvider>{ui}</ThemeProvider>);

describe('<Alert />', () => {
  it('expone role="alert" con título y mensaje', () => {
    renderAlert(
      <Alert severity="success" title="Listo">
        Inventario guardado
      </Alert>,
    );

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Listo');
    expect(alert).toHaveTextContent('Inventario guardado');
  });

  it.each(['success', 'info', 'warning', 'error'] as const)(
    'aplica la severidad %s',
    (severity) => {
      renderAlert(<Alert severity={severity}>Mensaje</Alert>);
      expect(screen.getByRole('alert')).toHaveClass(`MuiAlert-outlined${capitalize(severity)}`);
    },
  );

  it('muestra el botón de cerrar solo si hay onClose', async () => {
    const onClose = vi.fn();
    const { rerender } = renderAlert(<Alert severity="info">Mensaje</Alert>);
    expect(screen.queryByRole('button', { name: /close/i })).not.toBeInTheDocument();

    rerender(
      <ThemeProvider>
        <Alert severity="info" onClose={onClose}>
          Mensaje
        </Alert>
      </ThemeProvider>,
    );
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renderiza una acción contextual', () => {
    renderAlert(
      <Alert severity="error" action={<button type="button">Reintentar</button>}>
        Falló
      </Alert>,
    );
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument();
  });
});

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
