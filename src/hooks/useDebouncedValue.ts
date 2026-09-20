import { useEffect, useState } from 'react';

/**
 * Devuelve `value` con retraso: solo cambia cuando pasan `delayMs` sin nuevos cambios.
 * Útil para que un buscador no consulte la API en cada tecla.
 */
export function useDebouncedValue<T>(value: T, delayMs = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
