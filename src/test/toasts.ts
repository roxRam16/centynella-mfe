import { screen } from '@testing-library/react';

/**
 * Región donde aparecen las notificaciones (toasts). `hidden: true` porque mientras un modal
 * termina de cerrarse el resto de la página sigue marcado como oculto para lectores de pantalla.
 */
export const notifications = () =>
  screen.getByRole('region', { name: 'Notificaciones', hidden: true });

/** Zona viva (`polite` o `assertive`) en la que está un aviso. */
export const liveModeOf = (text: string | RegExp) =>
  screen.getByText(text).closest('[aria-live]')?.getAttribute('aria-live');
