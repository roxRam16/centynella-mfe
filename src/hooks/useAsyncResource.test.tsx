import { act, renderHook, waitFor } from '@testing-library/react';
import { useAsyncResource } from './useAsyncResource';

describe('useAsyncResource', () => {
  it('pasa de loading a success con los datos', async () => {
    const fetcher = vi.fn().mockResolvedValue('datos');
    const { result } = renderHook(() => useAsyncResource(fetcher));

    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current.status).toBe('success'));
    expect(result.current).toMatchObject({ status: 'success', data: 'datos' });
  });

  it('pasa a error normalizando el valor rechazado a Error', async () => {
    const fetcher = vi.fn().mockRejectedValue('falló');
    const { result } = renderHook(() => useAsyncResource(fetcher));

    await waitFor(() => expect(result.current.status).toBe('error'));
    expect(result.current).toMatchObject({ status: 'error', error: new Error('falló') });
  });

  it('recarga volviendo a llamar al fetcher', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce('uno').mockResolvedValueOnce('dos');
    const { result } = renderHook(() => useAsyncResource(fetcher));
    await waitFor(() => expect(result.current).toMatchObject({ data: 'uno' }));

    act(() => result.current.reload());
    expect(result.current.status).toBe('loading');
    await waitFor(() => expect(result.current).toMatchObject({ status: 'success', data: 'dos' }));
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('cancela la petición al desmontar y no actualiza el estado', async () => {
    let capturedSignal: AbortSignal | undefined;
    const fetcher = vi.fn((signal: AbortSignal) => {
      capturedSignal = signal;
      return new Promise<string>(() => {});
    });
    const { unmount } = renderHook(() => useAsyncResource(fetcher));

    unmount();
    expect(capturedSignal?.aborted).toBe(true);
  });
});
