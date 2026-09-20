import { useCallback, useEffect, useState } from 'react';

export type AsyncState<T> =
  { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; error: Error };

/**
 * Hook genérico para cargar un recurso asíncrono (reutilizable en toda la app y
 * en los remotes). Maneja loading/success/error, cancelación al desmontar y recarga.
 *
 * @param fetcher Función que recibe un `AbortSignal`. Debe tener referencia ESTABLE
 *                (función de módulo o `useCallback`); si cambia, se vuelve a cargar.
 */
export function useAsyncResource<T>(fetcher: (signal: AbortSignal) => Promise<T>) {
  const [state, setState] = useState<AsyncState<T>>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    fetcher(controller.signal)
      .then((data) => setState({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return; // desmontado o recarga en curso: se ignora
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        });
      });

    return () => controller.abort();
  }, [fetcher, attempt]);

  /** Vuelve a ejecutar el fetcher mostrando de nuevo el estado `loading`. */
  const reload = useCallback(() => {
    setState({ status: 'loading' });
    setAttempt((current) => current + 1);
  }, []);

  return { ...state, reload };
}
