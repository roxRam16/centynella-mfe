import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { useToast } from '@/hooks/useToast';
import { liveModeOf } from '@/test/toasts';
import { ThemeProvider } from '@/theme';
import { MAX_TOASTS, ToastProvider } from './ToastProvider';

const wrapper = ({ children }: { children: ReactNode }) => (
  <ThemeProvider>
    <ToastProvider>{children}</ToastProvider>
  </ThemeProvider>
);

describe('ToastProvider + useToast', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('useToast fuera del proveedor da un error claro', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => renderHook(() => useToast())).toThrow(/ToastProvider/);

    spy.mockRestore();
  });

  it('el valor del contexto es estable entre renders', () => {
    const { result, rerender } = renderHook(() => useToast(), { wrapper });
    const first = result.current;

    rerender();

    expect(result.current).toBe(first);
  });

  it('muestra un aviso de éxito en la zona amable', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => result.current.success('Usuario creado correctamente'));

    expect(screen.getByText('Usuario creado correctamente')).toBeInTheDocument();
    expect(liveModeOf('Usuario creado correctamente')).toBe('polite');
  });

  it('los errores aparecen en la zona asertiva y con su título', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => result.current.error('Correo duplicado', { title: 'No se pudo guardar' }));

    expect(screen.getByText('No se pudo guardar')).toBeInTheDocument();
    expect(liveModeOf('Correo duplicado')).toBe('assertive');
  });

  it('cada tipo dura lo suyo: los errores se quedan más que los éxitos', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.success('ok');
      result.current.error('mal');
    });

    act(() => vi.advanceTimersByTime(5100));
    expect(screen.queryByText('ok')).not.toBeInTheDocument();
    expect(screen.getByText('mal')).toBeInTheDocument();

    act(() => vi.advanceTimersByTime(3000));
    expect(screen.queryByText('mal')).not.toBeInTheDocument();
  });

  it('respeta una duración personalizada', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => result.current.info('rápido', { duration: 1000 }));

    act(() => vi.advanceTimersByTime(1100));

    expect(screen.queryByText('rápido')).not.toBeInTheDocument();
  });

  it('un aviso repetido no se apila: reemplaza al anterior', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.success('Guardado');
      result.current.success('Guardado');
      result.current.success('Guardado');
    });

    expect(screen.getAllByText('Guardado')).toHaveLength(1);
  });

  it(`muestra como máximo ${MAX_TOASTS} y descarta los más antiguos`, () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      for (let i = 1; i <= MAX_TOASTS + 2; i += 1) result.current.info(`aviso ${i}`);
    });

    expect(screen.queryByText('aviso 1')).not.toBeInTheDocument();
    expect(screen.queryByText('aviso 2')).not.toBeInTheDocument();
    expect(screen.getByText(`aviso ${MAX_TOASTS + 2}`)).toBeInTheDocument();
  });

  it('se puede cerrar con la X y limpiar todos', async () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    act(() => {
      result.current.success('uno');
      result.current.success('dos');
    });

    await userEvent.click(screen.getAllByRole('button', { name: 'Cerrar notificación' })[0]);
    expect(screen.queryByText('uno')).not.toBeInTheDocument();

    act(() => result.current.clear());
    expect(screen.queryByText('dos')).not.toBeInTheDocument();
  });

  it('un aviso disparado desde un componente sobrevive a que el componente desaparezca', () => {
    const Trigger = () => {
      const toast = useToast();
      return <button onClick={() => toast.success('Cuenta creada')}>lanzar</button>;
    };
    const { rerender } = render(<Trigger />, { wrapper });

    act(() => screen.getByRole('button', { name: 'lanzar' }).click());
    rerender(<p>otra pantalla</p>);

    expect(screen.getByText('Cuenta creada')).toBeInTheDocument();
  });
});
