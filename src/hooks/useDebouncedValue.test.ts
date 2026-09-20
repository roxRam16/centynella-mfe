import { act, renderHook } from '@testing-library/react';
import { useDebouncedValue } from './useDebouncedValue';

describe('useDebouncedValue', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('devuelve el valor inicial de inmediato', () => {
    const { result } = renderHook(() => useDebouncedValue('a', 300));

    expect(result.current).toBe('a');
  });

  it('solo actualiza tras el retraso y descarta los cambios intermedios', () => {
    const { result, rerender } = renderHook(({ value }) => useDebouncedValue(value, 300), {
      initialProps: { value: 'a' },
    });

    rerender({ value: 'ab' });
    act(() => vi.advanceTimersByTime(200));
    rerender({ value: 'abc' });
    act(() => vi.advanceTimersByTime(200));
    expect(result.current).toBe('a'); // todavía no pasaron 300 ms desde el último cambio

    act(() => vi.advanceTimersByTime(100));
    expect(result.current).toBe('abc');
  });
});
