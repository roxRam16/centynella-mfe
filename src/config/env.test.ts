import { config, parseEnv } from './env';

describe('parseEnv', () => {
  const valid = {
    VITE_APP_NAME: 'CENTYNELLA',
    VITE_APP_ENV: 'sandbox',
    VITE_API_BASE_URL: 'http://localhost:8000',
  };

  it('devuelve la configuración tipada', () => {
    expect(parseEnv(valid)).toEqual({
      appName: 'CENTYNELLA',
      appEnv: 'sandbox',
      apiBaseUrl: 'http://localhost:8000',
    });
  });

  it('quita la barra final de la URL base', () => {
    expect(parseEnv({ ...valid, VITE_API_BASE_URL: 'http://localhost:8000//' }).apiBaseUrl).toBe(
      'http://localhost:8000',
    );
  });

  it('usa un nombre por defecto', () => {
    expect(parseEnv({ ...valid, VITE_APP_NAME: undefined }).appName).toBe('CENTYNELLA');
  });

  it('falla con un ambiente no permitido', () => {
    expect(() => parseEnv({ ...valid, VITE_APP_ENV: 'staging' })).toThrow(/VITE_APP_ENV/);
    expect(() => parseEnv({ ...valid, VITE_APP_ENV: undefined })).toThrow(/VITE_APP_ENV/);
  });

  it('falla si falta la URL del backend', () => {
    expect(() => parseEnv({ ...valid, VITE_API_BASE_URL: '' })).toThrow(/VITE_API_BASE_URL/);
  });

  it('es inmutable', () => {
    expect(Object.isFrozen(parseEnv(valid))).toBe(true);
  });

  it('carga la configuración real desde import.meta.env', () => {
    expect(config.apiBaseUrl).toBe('http://api.test');
  });
});
