import { makeSession } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import * as authService from './authService';
import { tokenStore } from './tokenStore';

describe('authService', () => {
  afterEach(() => {
    tokenStore.clear();
    vi.unstubAllGlobals();
  });

  it('login envía las credenciales a /auth/login', async () => {
    const api = mockApi({ 'POST /api/v1/auth/login': () => ({ json: makeSession() }) });

    const session = await authService.login({ email: 'a@b.co', password: 'Clave12345' });

    expect(session.access_token).toBe('access-token-1');
    expect(api.calls[0].body).toEqual({ email: 'a@b.co', password: 'Clave12345' });
  });

  it('register, recuperación y restablecimiento usan los endpoints REST correctos', async () => {
    const api = mockApi({
      'POST /api/v1/auth/register': () => ({ status: 201, json: {} }),
      'POST /api/v1/auth/password-reset-requests': () => ({ status: 202 }),
      'POST /api/v1/auth/password-resets': () => undefined,
    });

    await authService.register({ name: 'Ana', email: 'a@b.co', password: 'Clave12345' });
    await authService.requestPasswordReset('a@b.co');
    await authService.resetPassword('tok', 'Nueva#12345');

    expect(api.calls.map((call) => call.path)).toEqual([
      '/api/v1/auth/register',
      '/api/v1/auth/password-reset-requests',
      '/api/v1/auth/password-resets',
    ]);
    expect(api.calls[2].body).toEqual({ token: 'tok', password: 'Nueva#12345' });
  });

  it('changePassword traduce a los nombres del contrato del backend', async () => {
    const api = mockApi({ 'PUT /api/v1/users/me/password': () => ({ json: makeSession() }) });

    await authService.changePassword('Actual123', 'Nueva#12345');

    expect(api.calls[0].body).toEqual({
      current_password: 'Actual123',
      new_password: 'Nueva#12345',
    });
  });

  it('getProfile y updateProfile usan /users/me', async () => {
    const api = mockApi({
      'GET /api/v1/users/me': () => ({ json: { name: 'Ana' } }),
      'PATCH /api/v1/users/me': () => ({ json: { name: 'Nuevo' } }),
    });

    await authService.getProfile();
    await authService.updateProfile('Nuevo');

    expect(api.calls[1].body).toEqual({ name: 'Nuevo' });
  });

  describe('refreshSession', () => {
    it('devuelve la sesión restaurada con la cookie', async () => {
      mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });

      await expect(authService.refreshSession()).resolves.toMatchObject({ expires_in: 900 });
    });

    it('devuelve null cuando no hay sesión (401)', async () => {
      mockApi({ 'POST /api/v1/auth/refresh': () => problem(401, 'no_session', 'x') });

      await expect(authService.refreshSession()).resolves.toBeNull();
    });

    it('propaga los demás errores (servidor caído)', async () => {
      mockApi({ 'POST /api/v1/auth/refresh': () => problem(503, 'down', 'x') });

      await expect(authService.refreshSession()).rejects.toMatchObject({ status: 503 });
    });

    it('comparte UNA petición entre llamadas simultáneas (single-flight)', async () => {
      const api = mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });

      const [first, second] = await Promise.all([
        authService.refreshSession(),
        authService.refreshSession(),
      ]);

      expect(api.calls).toHaveLength(1);
      expect(first).toBe(second);
    });

    it('permite una nueva renovación cuando la anterior terminó', async () => {
      const api = mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });

      await authService.refreshSession();
      await authService.refreshSession();

      expect(api.calls).toHaveLength(2);
    });
  });
});
