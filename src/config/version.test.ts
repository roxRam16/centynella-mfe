import { APP_LABEL, APP_TITLE, APP_VERSION } from './version';

describe('versión de la aplicación', () => {
  it('sale de package.json con formato X.Y.Z', () => {
    expect(APP_VERSION).toMatch(/^\d+\.\d+\.\d+$/);
  });

  it('el texto sigue el formato pedido para el login', () => {
    expect(APP_TITLE).toBe('Sistema de inventario IA 2025');
    expect(APP_LABEL).toBe(`Sistema de inventario IA 2025 - V.${APP_VERSION}`);
  });
});
