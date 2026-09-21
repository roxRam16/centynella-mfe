import { useEffect, useRef, useState } from 'react';

/**
 * ¿El elemento es más angosto que `threshold` px? Mide el ELEMENTO (no la ventana), así responde
 * también cuando el menú lateral se extiende y le quita espacio al contenido. Sin
 * `ResizeObserver` (navegadores muy viejos, pruebas) devuelve siempre `false`.
 */
export function useIsNarrow(threshold: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setNarrow(entry.contentRect.width < threshold);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, narrow] as const;
}
