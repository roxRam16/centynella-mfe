import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { LogEntry } from '@/services/types';
import { makePage, makeProfile } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import type { MockApi } from '@/test/mockApi';
import {
  applyAdvancedFilter,
  filterPanel,
  openAdvancedFilter,
  setAdvancedFilter,
} from '@/test/filters';
import { renderWithProviders } from '@/test/renderWithProviders';
import { LogsPage } from './LogsPage';

const entry = (overrides: Partial<LogEntry> = {}): LogEntry => ({
  id: 'log-1',
  timestamp: '2026-09-20T18:45:10Z',
  level: 'INFO',
  service: 'core',
  module: 'auth',
  event: 'auth.login.success',
  message: 'Sesión iniciada',
  environment: 'sandbox',
  request_id: 'req-abcdef123456',
  user_id: 'user-abcdef123456',
  session_id: 'sess-abcdef123456',
  ip: '127.0.0.1',
  details: { via: 'password' },
  ...overrides,
});

const login = entry();
const failed = entry({
  id: 'log-2',
  level: 'WARNING',
  event: 'auth.login.failed',
  message: 'Intento de login fallido',
  user_id: null,
  session_id: null,
  details: { reason: 'bad_password', email: 'a***@example.com' },
});

function setupApi(extra: Parameters<typeof mockApi>[0] = {}): MockApi {
  return mockApi({
    'GET /api/v1/logs': () => ({ json: makePage([login, failed], { page_size: 10 }) }),
    'GET /api/v1/logs/modules': () => ({ json: ['auth', 'database', 'users'] }),
    ...extra,
  });
}

const lastQuery = (api: MockApi) => api.callsTo('GET /api/v1/logs').at(-1)!.url.searchParams;

afterEach(() => vi.unstubAllGlobals());

describe('<LogsPage />', () => {
  it('lista los eventos con nivel, módulo, evento y total', async () => {
    setupApi();
    renderWithProviders(<LogsPage />);

    const row = await screen.findByRole('row', { name: /Sesión iniciada/ });
    expect(within(row).getByText('INFO')).toBeInTheDocument();
    expect(within(row).getByText('auth')).toBeInTheDocument();
    expect(within(row).getByText('auth.login.success')).toBeInTheDocument();
    expect(
      within(screen.getByRole('row', { name: /Intento de login fallido/ })).getByText('WARNING'),
    ).toBeInTheDocument();
    expect(screen.getByText('1–2 de 2')).toBeInTheDocument();
  });

  it('muestra "—" cuando el evento no tiene usuario o sesión (login fallido)', async () => {
    setupApi();
    renderWithProviders(<LogsPage />);

    const row = await screen.findByRole('row', { name: /Intento de login fallido/ });

    expect(
      within(row).queryByRole('button', { name: /Filtrar por usuario/ }),
    ).not.toBeInTheDocument();
    expect(within(row).getAllByText('—').length).toBeGreaterThanOrEqual(2);
  });

  it('carga los módulos disponibles en el filtro', async () => {
    setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });

    await setAdvancedFilter('Módulo', 'auth');

    expect(
      within(screen.getByRole('combobox', { name: 'Módulo' }))
        .getAllByRole('option')
        .map((o) => o.textContent),
    ).toEqual(['Todos', 'auth', 'database', 'users']);
  });

  it('filtra por módulo, nivel mínimo y periodo', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });

    await setAdvancedFilter('Módulo', 'auth');
    await setAdvancedFilter('Nivel', 'WARNING');
    await setAdvancedFilter('Periodo', '60');
    await applyAdvancedFilter();

    await waitFor(() => expect(lastQuery(api).get('module')).toBe('auth'));
    expect(lastQuery(api).get('level')).toBe('WARNING');
    expect(lastQuery(api).get('since')).toMatch(/^\d{4}-\d\d-\d\dT/);
  });

  it('busca en el mensaje con retraso', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });

    await userEvent.type(
      screen.getByRole('searchbox', { name: 'Buscar en el mensaje' }),
      'fallido',
    );

    await waitFor(() => expect(lastQuery(api).get('q')).toBe('fallido'));
  });

  it('un clic en el usuario, la sesión o la petición filtra por ese id (seguir el hilo)', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    const row = await screen.findByRole('row', { name: /Sesión iniciada/ });

    await userEvent.click(
      within(row).getByRole('button', { name: 'Filtrar por usuario user-abcdef123456' }),
    );
    await waitFor(() => expect(lastQuery(api).get('user_id')).toBe('user-abcdef123456'));
    await openAdvancedFilter();
    expect(within(filterPanel()).getByRole('textbox', { name: 'Usuario (id)' })).toHaveValue(
      'user-abcdef123456',
    );

    await userEvent.click(
      within(row).getByRole('button', { name: 'Filtrar por sesión sess-abcdef123456' }),
    );
    await waitFor(() => expect(lastQuery(api).get('session_id')).toBe('sess-abcdef123456'));

    await userEvent.click(
      within(row).getByRole('button', { name: 'Filtrar por petición req-abcdef123456' }),
    );
    await waitFor(() => expect(lastQuery(api).get('request_id')).toBe('req-abcdef123456'));
  });

  it('también se puede filtrar escribiendo los ids', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });

    await setAdvancedFilter('Sesión (id)', 'mi-sesion');
    await applyAdvancedFilter();

    await waitFor(() => expect(lastQuery(api).get('session_id')).toBe('mi-sesion'));
  });

  it('limpia todos los filtros', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });
    await setAdvancedFilter('Módulo', 'auth');
    await setAdvancedFilter('Usuario (id)', 'abc');
    await applyAdvancedFilter();
    await waitFor(() => expect(lastQuery(api).get('module')).toBe('auth'));

    await userEvent.click(screen.getByRole('button', { name: 'Restaurar' }));

    await waitFor(() => expect(lastQuery(api).get('module')).toBeNull());
    expect(lastQuery(api).get('user_id')).toBeNull();
    expect(
      within(filterPanel()).getByRole('button', { name: /^Usuario \(id\)/ }),
    ).toBeInTheDocument();
  });

  it('muestra 10 eventos por página por defecto y permite cambiarlo', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });
    expect(lastQuery(api).get('page_size')).toBe('10');

    await userEvent.selectOptions(screen.getByRole('combobox', { name: 'Mostrar' }), '100');

    await waitFor(() => expect(lastQuery(api).get('page_size')).toBe('100'));
  });

  it('pagina cuando hay más de una página', async () => {
    const api = setupApi({
      'GET /api/v1/logs': () => ({ json: makePage([login], { total: 80, page_size: 10 }) }),
    });
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });

    await userEvent.click(screen.getByRole('button', { name: /page 2/i }));

    await waitFor(() => expect(lastQuery(api).get('page')).toBe('2'));
  });

  it('el detalle muestra los datos del evento como texto (aunque traigan HTML)', async () => {
    const hostile = entry({
      id: 'log-3',
      message: 'Evento raro',
      details: { nota: '<script>alert(1)</script>' },
    });
    setupApi({ 'GET /api/v1/logs': () => ({ json: makePage([hostile]) }) });
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Evento raro/ });

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalle de auth.login.success' }),
    );

    const dialog = await screen.findByRole('dialog', { name: 'Detalle del evento' });
    const json = within(dialog).getByLabelText('Datos del evento en formato JSON');
    expect(json).toHaveTextContent('<script>alert(1)</script>'); // texto plano, no ejecutado
    expect(json.querySelector('script')).toBeNull();
    expect(json).toHaveTextContent('"modulo": "auth"');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Cerrar' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('Actualizar vuelve a consultar', async () => {
    const api = setupApi();
    renderWithProviders(<LogsPage />);
    await screen.findByRole('row', { name: /Sesión iniciada/ });
    const before = api.callsTo('GET /api/v1/logs').length;

    await userEvent.click(screen.getByRole('button', { name: 'Actualizar' }));

    await waitFor(() => expect(api.callsTo('GET /api/v1/logs').length).toBeGreaterThan(before));
  });

  it('muestra el error de carga y permite reintentar', async () => {
    let attempts = 0;
    setupApi({
      'GET /api/v1/logs': () =>
        ++attempts === 1 ? problem(500, 'boom', 'x') : { json: makePage([login]) },
    });
    renderWithProviders(<LogsPage />);

    expect(await screen.findByText('No se pudo cargar la bitácora')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('row', { name: /Sesión iniciada/ })).toBeInTheDocument();
  });

  it('informa cuando no hay eventos', async () => {
    setupApi({ 'GET /api/v1/logs': () => ({ json: makePage([]) }) });
    renderWithProviders(<LogsPage />, { auth: { user: makeProfile() } });

    expect(
      await screen.findByText('No hay eventos que coincidan con los filtros.'),
    ).toBeInTheDocument();
  });
});
