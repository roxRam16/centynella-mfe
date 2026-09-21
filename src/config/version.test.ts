import { APP_CREDITS, APP_TITLE, APP_VERSION } from './version';

describe('versión de la aplicación', () => {
  it('sale de package.json con formato X.Y.Z', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('el título y los créditos siguen el formato pedido para el login', () => {
    expect(APP_TITLE).toBe('Sistema de inventario IA');
    expect(APP_CREDITS).toBe(`Desarrollado por RRR - 2026 - V.${APP_VERSION}`);
  });
});
