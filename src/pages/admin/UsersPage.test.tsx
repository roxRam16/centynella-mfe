import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { makePage, makeProfile, makeRole, makeUser } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import type { MockApi } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { notifications } from '@/test/toasts';
import { UsersPage } from './UsersPage';

const ana = makeUser({ id: 'u-1', name: 'Ana Pérez', email: 'ana@example.com', role: 'viewer' });
const luis = makeUser({
  id: 'u-2',
  name: 'Luis Gómez',
  email: 'luis@example.com',
  role: 'manager',
  status: 'disabled',
  last_login_at: null,
});
const roles = [
  makeRole({ key: 'admin', name: 'Administrador' }),
  makeRole({ key: 'manager', name: 'Gerente' }),
  makeRole({ key: 'viewer', name: 'Consulta' }),
];

function setupApi(extra: Parameters<typeof mockApi>[0] = {}): MockApi {
  return mockApi({
    'GET /api/v1/users': () => ({ json: makePage([ana, luis]) }),
    'GET /api/v1/roles': () => ({ json: roles }),
    ...extra,
  });
}

const rowOf = (name: string) => screen.getByRole('row', { name: new RegExp(name) });

afterEach(() => vi.unstubAllGlobals());

describe('<UsersPage />', () => {
  it('lista los usuarios con su rol (nombre legible), estado y último acceso', async () => {
    setupApi();
    renderWithProviders(<UsersPage />);

    const row = await screen.findByRole('row', { name: /Ana Pérez/ });
    expect(within(row).getByText('ana@example.com')).toBeInTheDocument();
    expect(within(row).getByText('Consulta')).toBeInTheDocument(); // "viewer" → nombre del rol
    expect(within(row).getByText('Activo')).toBeInTheDocument();
    expect(within(rowOf('Luis Gómez')).getByText('Deshabilitado')).toBeInTheDocument();
    expect(within(rowOf('Luis Gómez')).getByText('Nunca')).toBeInTheDocument();
  });

  it('busca con retraso (debounce) y vuelve a la página 1', async () => {
    const api = setupApi();
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.type(screen.getByLabelText('Buscar'), 'luis');

    await waitFor(() =>
      expect(api.callsTo('GET /api/v1/users').at(-1)?.url.searchParams.get('q')).toBe('luis'),
    );
  });

  it('filtra por estado', async () => {
    const api = setupApi();
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.selectOptions(screen.getByLabelText('Estado'), 'disabled');

    await waitFor(() =>
      expect(api.callsTo('GET /api/v1/users').at(-1)?.url.searchParams.get('status')).toBe(
        'disabled',
      ),
    );
  });

  it('pagina cuando hay más de una página', async () => {
    const api = setupApi({
      'GET /api/v1/users': () => ({ json: makePage([ana], { total: 25 }) }),
    });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: /page 2/i }));

    await waitFor(() =>
      expect(api.callsTo('GET /api/v1/users').at(-1)?.url.searchParams.get('page')).toBe('2'),
    );
  });

  it('crea un usuario desde el diálogo', async () => {
    const api = setupApi({
      'POST /api/v1/users': () => ({ status: 201, json: makeUser({ id: 'u-3' }) }),
    });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo usuario' });
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Marta Ruiz');
    await userEvent.type(within(dialog).getByLabelText('Correo electrónico'), 'marta@example.com');
    await userEvent.type(within(dialog).getByLabelText('Contraseña inicial'), 'Segura#12345');
    await userEvent.selectOptions(within(dialog).getByLabelText('Rol'), 'manager');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear usuario' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/users')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/users')[0].body).toEqual({
      name: 'Marta Ruiz',
      email: 'marta@example.com',
      password: 'Segura#12345',
      role: 'manager',
      status: 'active',
    });
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(api.callsTo('GET /api/v1/users').length).toBeGreaterThan(1); // recargó el listado
    expect(await screen.findByRole('region', { name: 'Notificaciones' })).toHaveTextContent(
      /Usuario ".+" creado correctamente/,
    );
  });

  it('valida el formulario y muestra los errores del backend dentro del diálogo', async () => {
    setupApi({ 'POST /api/v1/users': () => problem(409, 'email_taken', 'x') });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo usuario' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear usuario' }));
    expect(await within(dialog).findByText('Ingresa tu correo electrónico')).toBeInTheDocument();

    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Ana Copia');
    await userEvent.type(within(dialog).getByLabelText('Correo electrónico'), 'ana@example.com');
    await userEvent.type(within(dialog).getByLabelText('Contraseña inicial'), 'Segura#12345');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear usuario' }));

    expect(
      await within(dialog).findByText('Ya existe una cuenta con ese correo.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument(); // sigue abierto para corregir
  });

  it('edita un usuario: el correo queda bloqueado y solo se envían los campos editables', async () => {
    const api = setupApi({ 'PATCH /api/v1/users/u-1': () => ({ json: ana }) });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: 'Editar a Ana Pérez' }));
    const dialog = await screen.findByRole('dialog', { name: 'Editar usuario' });
    expect(within(dialog).getByLabelText('Correo electrónico')).toBeDisabled();
    expect(within(dialog).queryByLabelText('Contraseña inicial')).not.toBeInTheDocument();
    await userEvent.selectOptions(within(dialog).getByLabelText('Rol'), 'manager');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.callsTo('PATCH /api/v1/users/u-1')).toHaveLength(1));
    expect(api.callsTo('PATCH /api/v1/users/u-1')[0].body).toEqual({
      name: 'Ana Pérez',
      role: 'manager',
      status: 'active',
    });
    expect(await screen.findByRole('region', { name: 'Notificaciones' })).toHaveTextContent(
      /actualizado correctamente/,
    );
  });

  it('elimina un usuario tras confirmar', async () => {
    const api = setupApi({ 'DELETE /api/v1/users/u-1': () => undefined });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Ana Pérez' }));
    const dialog = await screen.findByRole('dialog', { name: 'Eliminar usuario' });
    expect(dialog).toHaveTextContent('¿Seguro que quieres eliminar a Ana Pérez?');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Eliminar' }));

    await waitFor(() => expect(api.callsTo('DELETE /api/v1/users/u-1')).toHaveLength(1));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    expect(notifications()).toHaveTextContent('Usuario "Ana Pérez" eliminado correctamente');
  });

  it('muestra el error si no se puede eliminar (p. ej. último administrador)', async () => {
    setupApi({ 'DELETE /api/v1/users/u-1': () => problem(409, 'last_admin', 'x') });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Ana Pérez/ });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar a Ana Pérez' }));
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }),
    );

    await screen.findByText(/No se pudo eliminar/);
    const toast = notifications();
    expect(toast).toHaveTextContent('No se pudo eliminar el usuario');
    expect(toast).toHaveTextContent('Debe existir al menos un administrador activo.');
  });

  it('no permite eliminarse a sí mismo', async () => {
    setupApi({
      'GET /api/v1/users': () => ({
        json: makePage([makeUser({ id: 'admin-1', name: 'Admin Principal' })]),
      }),
    });
    renderWithProviders(<UsersPage />);
    await screen.findByRole('row', { name: /Admin Principal/ });

    expect(screen.getByRole('button', { name: 'Eliminar a Admin Principal' })).toBeDisabled();
  });

  it('oculta las acciones que el usuario no puede realizar', async () => {
    setupApi();
    renderWithProviders(<UsersPage />, {
      auth: { user: makeProfile({ permissions: ['users:read'] }) },
    });
    await screen.findByRole('row', { name: /Ana Pérez/ });

    expect(screen.queryByRole('button', { name: 'Nuevo usuario' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar a/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Eliminar a/ })).not.toBeInTheDocument();
  });

  it('sin roles:read no consulta los roles y oculta el filtro por rol', async () => {
    const api = setupApi();
    renderWithProviders(<UsersPage />, {
      auth: { user: makeProfile({ permissions: ['users:read'] }) },
    });
    await screen.findByRole('row', { name: /Ana Pérez/ });

    expect(api.callsTo('GET /api/v1/roles')).toHaveLength(0);
    expect(screen.queryByLabelText('Rol')).not.toBeInTheDocument();
    expect(within(rowOf('Ana Pérez')).getByText('viewer')).toBeInTheDocument(); // cae a la clave
  });

  it('muestra el error de carga y permite reintentar', async () => {
    let attempts = 0;
    setupApi({
      'GET /api/v1/users': () =>
        ++attempts === 1 ? problem(500, 'boom', 'x') : { json: makePage([ana]) },
    });
    renderWithProviders(<UsersPage />);

    expect(await screen.findByText('No se pudo cargar el listado')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('row', { name: /Ana Pérez/ })).toBeInTheDocument();
  });

  it('informa cuando no hay resultados', async () => {
    setupApi({ 'GET /api/v1/users': () => ({ json: makePage([]) }) });
    renderWithProviders(<UsersPage />);

    expect(
      await screen.findByText('No hay usuarios que coincidan con los filtros.'),
    ).toBeInTheDocument();
  });
});
