import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { publishAuthEvent, subscribeAuthEvents } from '@/services/authChannel';
import { apiRequest, registerSessionRefresher } from '@/services/apiClient';
import { tokenStore } from '@/services/tokenStore';
import { makeProfile, makeSession } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import { useAuth } from '@/hooks/useAuth';
import { AuthProvider } from './AuthProvider';

vi.mock('@/services/authChannel', () => ({
  publishAuthEvent: vi.fn(),
  subscribeAuthEvents: vi.fn(() => () => {}),
}));

function Probe() {
  const auth = useAuth();
  return (
    <div>
      <span data-testid="status">{auth.status}</span>
      <span data-testid="user">{auth.user?.name ?? '-'}</span>
      <span data-testid="can-read">{String(auth.hasPermission('users:read'))}</span>
      <button onClick={() => void auth.login({ email: 'a@b.co', password: 'Clave12345' })}>
        entrar
      </button>
      <button onClick={() => void auth.logout()}>salir</button>
    </div>
  );
}

const renderProvider = () =>
  render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );

const status = () => screen.getByTestId('status').textContent;

describe('<AuthProvider />', () => {
  afterEach(() => {
    tokenStore.clear();
    registerSessionRefresher(null);
    vi.unstubAllGlobals();
    vi.clearAllMocks();
    vi.useRealTimers();
  });

  it('empieza en "loading" mientras restaura la sesión', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });
    renderProvider();

    expect(status()).toBe('loading');
    await waitFor(() => expect(status()).toBe('authenticated'));
  });

  it('restaura la sesión al abrir la app usando solo la cookie (persistencia)', async () => {
    const api = mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });
    renderProvider();

    await waitFor(() => expect(status()).toBe('authenticated'));

    expect(screen.getByTestId('user')).toHaveTextContent('Admin Principal');
    expect(tokenStore.get()).toBe('access-token-1');
    expect(api.calls[0].credentials).toBe('include');
  });

  it('queda anónimo si no hay sesión (401)', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => problem(401, 'no_session', 'x') });
    renderProvider();

    await waitFor(() => expect(status()).toBe('anonymous'));

    expect(tokenStore.get()).toBeNull();
  });

  it('queda anónimo si el servidor no responde', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => problem(503, 'down', 'x') });
    renderProvider();

    await waitFor(() => expect(status()).toBe('anonymous'));
  });

  it('inicia sesión, guarda el token y avisa a las demás pestañas', async () => {
    mockApi({
      'POST /api/v1/auth/refresh': () => problem(401, 'no_session', 'x'),
      'POST /api/v1/auth/login': () => ({ json: makeSession() }),
    });
    renderProvider();
    await waitFor(() => expect(status()).toBe('anonymous'));

    await userEvent.click(screen.getByRole('button', { name: 'entrar' }));

    await waitFor(() => expect(status()).toBe('authenticated'));
    expect(tokenStore.get()).toBe('access-token-1');
    expect(publishAuthEvent).toHaveBeenCalledWith('login');
  });

  it('expone los permisos del usuario', async () => {
    mockApi({
      'POST /api/v1/auth/refresh': () => ({
        json: makeSession({ user: makeProfile({ permissions: ['users:read'] }) }),
      }),
    });
    renderProvider();

    await waitFor(() => expect(screen.getByTestId('can-read')).toHaveTextContent('true'));
  });

  it('cierra la sesión: llama al backend, limpia el token y avisa a las demás pestañas', async () => {
    const api = mockApi({
      'POST /api/v1/auth/refresh': () => ({ json: makeSession() }),
      'POST /api/v1/auth/logout': () => undefined,
    });
    renderProvider();
    await waitFor(() => expect(status()).toBe('authenticated'));

    await userEvent.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() => expect(status()).toBe('anonymous'));
    expect(api.callsTo('POST /api/v1/auth/logout')).toHaveLength(1);
    expect(tokenStore.get()).toBeNull();
    expect(publishAuthEvent).toHaveBeenCalledWith('logout');
  });

  it('cierra la sesión localmente aunque falle la red', async () => {
    mockApi({
      'POST /api/v1/auth/refresh': () => ({ json: makeSession() }),
      'POST /api/v1/auth/logout': () => problem(500, 'boom', 'x'),
    });
    renderProvider();
    await waitFor(() => expect(status()).toBe('authenticated'));

    await userEvent.click(screen.getByRole('button', { name: 'salir' }));

    await waitFor(() => expect(status()).toBe('anonymous'));
  });

  it('cierra la sesión cuando otra pestaña la cierra', async () => {
    mockApi({ 'POST /api/v1/auth/refresh': () => ({ json: makeSession() }) });
    renderProvider();
    await waitFor(() => expect(status()).toBe('authenticated'));

    const handler = vi.mocked(subscribeAuthEvents).mock.calls.at(-1)![0];
    act(() => handler('logout'));

    expect(status()).toBe('anonymous');
    expect(tokenStore.get()).toBeNull();
  });

  it('renueva el access token antes de que venza', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    let refreshes = 0;
    const api = mockApi({
      'POST /api/v1/auth/refresh': () => ({
        json: makeSession({ access_token: `token-${++refreshes}`, expires_in: 120 }),
      }),
    });
    renderProvider();
    await waitFor(() => expect(tokenStore.get()).toBe('token-1'));

    await act(() => vi.advanceTimersByTimeAsync(61_000)); // 120 s de vida − 60 s de margen

    await waitFor(() => expect(tokenStore.get()).toBe('token-2'));
    expect(api.callsTo('POST /api/v1/auth/refresh')).toHaveLength(2);
  });

  it('ante un 401 el cliente HTTP renueva la sesión y reintenta la petición', async () => {
    let refreshes = 0;
    let attempts = 0;
    const api = mockApi({
      'POST /api/v1/auth/refresh': () => ({
        json: makeSession({ access_token: `token-${++refreshes}` }),
      }),
      'GET /api/v1/roles': () =>
        ++attempts === 1 ? problem(401, 'token_expired', 'x') : { json: [] },
    });
    renderProvider();
    await waitFor(() => expect(tokenStore.get()).toBe('token-1'));

    await apiRequest('/roles');

    const roleCalls = api.callsTo('GET /api/v1/roles');
    expect(roleCalls).toHaveLength(2);
    expect(roleCalls[1].headers.Authorization).toBe('Bearer token-2');
  });

  it('useAuth falla con un mensaje claro fuera del proveedor', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow('useAuth debe usarse dentro de <AuthProvider>');

    spy.mockRestore();
  });
});
