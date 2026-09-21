import { useState } from 'react';

/** Cómo se muestran los registros de un módulo: tabla (grid) o tarjetas. */
export type ViewMode = 'grid' | 'cards';

const storageKey = (moduleKey: string) => `centynella:view:${moduleKey}`;

const isViewMode = (value: unknown): value is ViewMode => value === 'grid' || value === 'cards';

/**
 * Vista elegida de un módulo, recordada en este navegador (localStorage). Si el almacenamiento
 * no está disponible (modo privado, bloqueado) simplemente no se recuerda.
 */
export function useViewMode(moduleKey: string, fallback: ViewMode = 'grid') {
  const [view, setView] = useState<ViewMode>(() => {
    try {
      const saved = window.localStorage.getItem(storageKey(moduleKey));
      return isViewMode(saved) ? saved : fallback;
    } catch {
      return fallback;
    }
  });

  const changeView = (next: ViewMode) => {
    setView(next);
    try {
      window.localStorage.setItem(storageKey(moduleKey), next);
    } catch {
      /* sin almacenamiento: la vista vale solo para esta sesión */
    }
  };

  return [view, changeView] as const;
}
