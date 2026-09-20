/**
 * Sincroniza la sesión entre pestañas del mismo navegador: si cierras sesión en una,
 * las demás se enteran al instante (y no quedan mostrando datos de una sesión cerrada).
 */
export type AuthEvent = 'login' | 'logout';

const CHANNEL_NAME = 'centynella-auth';

const isSupported = (): boolean => typeof BroadcastChannel !== 'undefined';

/** Avisa a las demás pestañas. No llega a la pestaña que lo emite. */
export function publishAuthEvent(event: AuthEvent): void {
  if (!isSupported()) return;
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.postMessage(event);
  channel.close();
}

/** Escucha los eventos de otras pestañas. Devuelve la función para dejar de escuchar. */
export function subscribeAuthEvents(handler: (event: AuthEvent) => void): () => void {
  if (!isSupported()) return () => {};
  const channel = new BroadcastChannel(CHANNEL_NAME);
  channel.onmessage = (message: MessageEvent<AuthEvent>) => handler(message.data);
  return () => channel.close();
}
