import { HttpError } from '@/services/httpClient';
import { getErrorMessage } from './errors';

const httpError = (status: number, code?: string, detail?: string, retryAfter?: number) =>
  new HttpError(status, 'X', { code, detail }, retryAfter);

describe('getErrorMessage', () => {
  it('traduce los códigos conocidos del backend', () => {
    expect(getErrorMessage(httpError(401, 'invalid_credentials'))).toBe(
      'Correo o contraseña incorrectos.',
    );
    expect(getErrorMessage(httpError(409, 'email_taken'))).toBe(
      'Ya existe una cuenta con ese correo.',
    );
  });

  it('indica cuántos minutos esperar cuando la cuenta está bloqueada', () => {
    expect(getErrorMessage(httpError(429, 'account_locked', undefined, 900))).toContain(
      '15 minutos',
    );
    expect(getErrorMessage(httpError(429, 'account_locked', undefined, 30))).toContain('1 minuto.');
    expect(getErrorMessage(httpError(429, 'account_locked'))).toContain('más tarde');
  });

  it('usa el detalle del backend cuando el código no está mapeado', () => {
    expect(getErrorMessage(httpError(404, 'algo_raro', 'Usuario no encontrado.'))).toBe(
      'Usuario no encontrado.',
    );
  });

  it('distingue validación y errores del servidor', () => {
    expect(getErrorMessage(httpError(422))).toBe('Revisa los datos ingresados.');
    expect(getErrorMessage(httpError(500, undefined, 'stack interno'))).toContain('servidor');
  });

  it('reconoce los fallos de red (fetch lanza TypeError)', () => {
    expect(getErrorMessage(new TypeError('Failed to fetch'))).toContain('No se pudo conectar');
  });

  it('usa el mensaje por defecto para errores desconocidos', () => {
    expect(getErrorMessage(new Error('x'))).toContain('inesperado');
    expect(getErrorMessage('x', 'Mi mensaje')).toBe('Mi mensaje');
    expect(getErrorMessage(httpError(400), 'Por defecto')).toBe('Por defecto');
  });
});
