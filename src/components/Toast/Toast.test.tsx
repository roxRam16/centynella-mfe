import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { liveModeOf } from '@/test/toasts';
import { ThemeProvider } from '@/theme';
import { Toast } from './Toast';
import type { ToastData } from './Toast';
import { ToastViewport } from './ToastViewport';

const data = (overrides: Partial<ToastData> = {}): ToastData => ({
  id: 't1',
  severity: 'success',
  message: 'Usuario creado correctamente',
  duration: 5000,
  ...overrides,
});

const renderToast = (toast: ToastData, onDismiss = vi.fn()) => {
  render(
    <ThemeProvider>
      <Toast toast={toast} onDismiss={onDismiss} />
    </ThemeProvider>,
  );
  return onDismiss;
};

describe('<Toast />', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('muestra el mensaje y el título opcional', () => {
    renderToast(data({ title: 'Listo' }));

    expect(screen.getByText('Usuario creado correctamente')).toBeInTheDocument();
    expect(screen.getByText('Listo')).toBeInTheDocument();
  });

  it.each(['success', 'info', 'warning', 'error'] as const)(
    'el tipo "%s" lleva icono además del color (no solo color)',
    (severity) => {
      renderToast(data({ severity }));

      expect(
        screen.getByText('Usuario creado correctamente').closest('[data-severity]'),
      ).toHaveAttribute('data-severity', severity);
      expect(document.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument();
    },
  );

  it('se cierra sola al terminar su duración', () => {
    const onDismiss = renderToast(data({ duration: 3000 }));

    act(() => vi.advanceTimersByTime(2999));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(2));
    expect(onDismiss).toHaveBeenCalledWith('t1');
  });

  it('con duración 0 permanece hasta que la cierren', () => {
    const onDismiss = renderToast(data({ duration: 0 }));

    act(() => vi.advanceTimersByTime(60_000));

    expect(onDismiss).not.toHaveBeenCalled();
  });

  it('se cierra con el botón de la X', async () => {
    const onDismiss = renderToast(data());

    await userEvent.click(screen.getByRole('button', { name: 'Cerrar notificación' }));

    expect(onDismiss).toHaveBeenCalledWith('t1');
  });

  it('pausa el reloj mientras el cursor está encima y sigue con el tiempo restante', async () => {
    const onDismiss = renderToast(data({ duration: 4000 }));
    const toast = screen.getByText('Usuario creado correctamente');

    act(() => vi.advanceTimersByTime(3000));
    await userEvent.hover(toast);
    act(() => vi.advanceTimersByTime(10_000));
    expect(onDismiss).not.toHaveBeenCalled();

    await userEvent.unhover(toast);
    act(() => vi.advanceTimersByTime(900));
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => vi.advanceTimersByTime(200));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('también se pausa mientras tiene el foco del teclado', async () => {
    const onDismiss = renderToast(data({ duration: 2000 }));

    await userEvent.tab();
    act(() => vi.advanceTimersByTime(10_000));

    expect(screen.getByRole('button', { name: 'Cerrar notificación' })).toHaveFocus();
    expect(onDismiss).not.toHaveBeenCalled();
  });
});

describe('<ToastViewport />', () => {
  const renderViewport = (toasts: ToastData[]) =>
    render(
      <ThemeProvider>
        <ToastViewport toasts={toasts} onDismiss={vi.fn()} />
      </ThemeProvider>,
    );

  it('tiene una región de notificaciones con dos zonas vivas permanentes', () => {
    renderViewport([]);

    expect(screen.getByRole('region', { name: 'Notificaciones' })).toBeInTheDocument();
    const region = screen.getByRole('region', { name: 'Notificaciones' });
    expect(region.querySelector('[aria-live="polite"]')).toBeInTheDocument();
    expect(region.querySelector('[aria-live="assertive"]')).toBeInTheDocument();
  });

  it('los errores van a la zona asertiva y lo demás a la amable', () => {
    renderViewport([
      data({ id: 'a', message: 'Guardado' }),
      data({ id: 'b', severity: 'error', message: 'Falló' }),
    ]);

    expect(liveModeOf('Guardado')).toBe('polite');
    expect(liveModeOf('Falló')).toBe('assertive');
  });
});
