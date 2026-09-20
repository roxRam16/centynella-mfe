import { mockApi, problem } from '@/test/mockApi';
import { apiRequest, registerSessionRefresher } from './apiClient';
import { HttpError } from './httpClient';
import { tokenStore } from './tokenStore';

describe('tokenStore', () => {
  it('guarda y limpia el token solo en memoria', () => {
    tokenStore.set('abc');
    expect(tokenStore.get()).toBe('abc');

    tokenStore.clear();
    expect(tokenStore.get()).toBeNull();
    expect(localStorage.length).toBe(0); // nunca toca localStorage
  });
});

describe('apiRequest', () => {
  afterEach(() => {
    tokenStore.clear();
    registerSessionRefresher(null);
    vi.unstubAllGlobals();
  });

  it('adjunta el access token, envía cookies y devuelve el JSON', async () => {
    tokenStore.set('mi-token');
    const api = mockApi({ 'GET /api/v1/users/me': () => ({ json: { name: 'Ana' } }) });

    await expect(apiRequest('/users/me')).resolves.toEqual({ name: 'Ana' });

    expect(api.calls[0].headers.Authorization).toBe('Bearer mi-token');
    expect(api.calls[0].credentials).toBe('include');
  });

  it('no adjunta token cuando auth es false', async () => {
    tokenStore.set('mi-token');
    const api = mockApi({ 'POST /api/v1/auth/login': () => ({ json: {} }) });

    await apiRequest('/auth/login', { method: 'POST', body: { a: 1 }, auth: false });

    expect(api.calls[0].headers.Authorization).toBeUndefined();
    expect(api.calls[0].headers['Content-Type']).toBe('application/json');
    expect(api.calls[0].body).toEqual({ a: 1 });
  });

  it('arma la query ignorando valores vacíos', async () => {
    const api = mockApi({ 'GET /api/v1/users': () => ({ json: {} }) });

    await apiRequest('/users', {
      query: { q: 'ana', role: '', status: undefined, page: 2, x: null },
    });

    expect(api.calls[0].url.search).toBe('?q=ana&page=2');
  });

  it('devuelve undefined en 204', async () => {
    mockApi({ 'DELETE /api/v1/users/1': () => undefined });

    await expect(apiRequest('/users/1', { method: 'DELETE' })).resolves.toBeUndefined();
  });

  it('convierte los errores del backend en HttpError con su code', async () => {
    mockApi({
      'POST /api/v1/auth/login': () =>
        problem(429, 'account_locked', 'Bloqueada', { 'Retry-After': '120' }),
    });

    const error = await apiRequest('/auth/login', { method: 'POST', auth: false }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(HttpError);
    expect(error).toMatchObject({ status: 429, code: 'account_locked', retryAfter: 120 });
  });

  it('ante un 401 renueva la sesión y reintenta con el token nuevo', async () => {
    tokenStore.set('viejo');
    let attempt = 0;
    const api = mockApi({
      'GET /api/v1/users/me': () =>
        ++attempt === 1 ? problem(401, 'token_expired', 'x') : { json: { ok: true } },
    });
    registerSessionRefresher(async () => {
      tokenStore.set('nuevo');
      return true;
    });

    await expect(apiRequest('/users/me')).resolves.toEqual({ ok: true });

    expect(api.calls).toHaveLength(2);
    expect(api.calls[1].headers.Authorization).toBe('Bearer nuevo');
  });

  it('si la renovación falla, propaga el 401 sin reintentar', async () => {
    const api = mockApi({ 'GET /api/v1/users/me': () => problem(401, 'token_expired', 'x') });
    registerSessionRefresher(async () => false);

    await expect(apiRequest('/users/me')).rejects.toMatchObject({ status: 401 });

    expect(api.calls).toHaveLength(1);
  });

  it('no intenta renovar en endpoints públicos', async () => {
    const refresher = vi.fn().mockResolvedValue(true);
    registerSessionRefresher(refresher);
    mockApi({ 'POST /api/v1/auth/login': () => problem(401, 'invalid_credentials', 'x') });

    await expect(apiRequest('/auth/login', { method: 'POST', auth: false })).rejects.toMatchObject({
      code: 'invalid_credentials',
    });

    expect(refresher).not.toHaveBeenCalled();
  });
});
