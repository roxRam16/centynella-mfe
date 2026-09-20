import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PERMISSION_CATALOG, makeProfile, makeRole } from '@/test/factories';
import { mockApi, problem } from '@/test/mockApi';
import { renderWithProviders } from '@/test/renderWithProviders';
import { RolesPage } from './RolesPage';

const admin = makeRole({
  key: 'admin',
  name: 'Administrador',
  permissions: ['users:read', 'roles:manage'],
});
const viewer = makeRole({ key: 'viewer', name: 'Consulta', permissions: [] });
const auditor = makeRole({
  key: 'auditor',
  name: 'Auditor',
  description: 'Solo lectura',
  permissions: ['users:read'],
  is_system: false,
});

const setupApi = (extra: Parameters<typeof mockApi>[0] = {}) =>
  mockApi({
    'GET /api/v1/roles': () => ({ json: [admin, viewer, auditor] }),
    'GET /api/v1/permissions': () => ({ json: PERMISSION_CATALOG }),
    ...extra,
  });

/** Consultas dentro de la tarjeta (`<article>`) del rol con ese nombre. */
const cardOf = (name: string) => within(screen.getByRole('heading', { name }).closest('article')!);

afterEach(() => vi.unstubAllGlobals());

describe('<RolesPage />', () => {
  it('lista los roles con sus permisos y marca los de sistema', async () => {
    setupApi();
    renderWithProviders(<RolesPage />);

    expect(await screen.findByRole('heading', { name: 'Administrador' })).toBeInTheDocument();
    const adminCard = cardOf('Administrador');
    expect(adminCard.getByText('users:read')).toBeInTheDocument();
    expect(adminCard.getByText('Sistema')).toBeInTheDocument();
    expect(cardOf('Consulta').getByText('Sin permisos')).toBeInTheDocument();
    expect(cardOf('Auditor').queryByText('Sistema')).not.toBeInTheDocument();
  });

  it('no permite eliminar roles de sistema pero sí los personalizados', async () => {
    setupApi();
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    expect(screen.getByRole('button', { name: 'Eliminar el rol Consulta' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Eliminar el rol Auditor' })).toBeEnabled();
  });

  it('elimina un rol personalizado tras confirmar', async () => {
    const api = setupApi({ 'DELETE /api/v1/roles/auditor': () => undefined });
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar el rol Auditor' }));
    await userEvent.click(
      within(await screen.findByRole('dialog', { name: 'Eliminar rol' })).getByRole('button', {
        name: 'Eliminar',
      }),
    );

    await waitFor(() => expect(api.callsTo('DELETE /api/v1/roles/auditor')).toHaveLength(1));
  });

  it('avisa si el rol tiene usuarios asignados', async () => {
    setupApi({ 'DELETE /api/v1/roles/auditor': () => problem(409, 'role_in_use', 'x') });
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    await userEvent.click(screen.getByRole('button', { name: 'Eliminar el rol Auditor' }));
    await userEvent.click(
      within(await screen.findByRole('dialog')).getByRole('button', { name: 'Eliminar' }),
    );

    expect(await screen.findByText(/tiene usuarios asignados/)).toBeInTheDocument();
  });

  it('crea un rol eligiendo permisos del catálogo', async () => {
    const api = setupApi({ 'POST /api/v1/roles': () => ({ status: 201, json: auditor }) });
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo rol' }));
    const dialog = await screen.findByRole('dialog', { name: 'Nuevo rol' });
    await userEvent.type(within(dialog).getByLabelText('Clave'), 'bodeguero');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Bodeguero');
    await userEvent.click(within(dialog).getByRole('checkbox', { name: /users:read/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear rol' }));

    await waitFor(() => expect(api.callsTo('POST /api/v1/roles')).toHaveLength(1));
    expect(api.callsTo('POST /api/v1/roles')[0].body).toEqual({
      key: 'bodeguero',
      name: 'Bodeguero',
      description: '',
      permissions: ['users:read'],
    });
  });

  it('valida la clave del rol', async () => {
    const api = setupApi();
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    await userEvent.click(screen.getByRole('button', { name: 'Nuevo rol' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(within(dialog).getByLabelText('Clave'), 'Con Espacios');
    await userEvent.type(within(dialog).getByLabelText('Nombre'), 'Algo');
    await userEvent.click(within(dialog).getByRole('button', { name: 'Crear rol' }));

    expect(await within(dialog).findByText(/Usa minúsculas/)).toBeInTheDocument();
    expect(api.callsTo('POST /api/v1/roles')).toHaveLength(0);
  });

  it('edita los permisos de un rol', async () => {
    const api = setupApi({ 'PATCH /api/v1/roles/auditor': () => ({ json: auditor }) });
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Auditor' });

    await userEvent.click(screen.getByRole('button', { name: 'Editar el rol Auditor' }));
    const dialog = await screen.findByRole('dialog', { name: /Editar rol/ });
    expect(within(dialog).queryByLabelText('Clave')).not.toBeInTheDocument(); // la clave no cambia
    await userEvent.click(within(dialog).getByRole('checkbox', { name: /roles:read/ }));
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.callsTo('PATCH /api/v1/roles/auditor')).toHaveLength(1));
    expect(
      (
        api.callsTo('PATCH /api/v1/roles/auditor')[0].body as { permissions: string[] }
      ).permissions.sort(),
    ).toEqual(['roles:read', 'users:read']);
  });

  it('los permisos del administrador están bloqueados', async () => {
    const api = setupApi({ 'PATCH /api/v1/roles/admin': () => ({ json: admin }) });
    renderWithProviders(<RolesPage />);
    await screen.findByRole('heading', { name: 'Administrador' });

    await userEvent.click(screen.getByRole('button', { name: 'Editar el rol Administrador' }));
    const dialog = await screen.findByRole('dialog');
    expect(within(dialog).getByText(/siempre tiene todos los permisos/)).toBeInTheDocument();
    for (const checkbox of within(dialog).getAllByRole('checkbox')) {
      expect(checkbox).toBeDisabled();
      expect(checkbox).toBeChecked();
    }
    await userEvent.click(within(dialog).getByRole('button', { name: 'Guardar cambios' }));

    await waitFor(() => expect(api.callsTo('PATCH /api/v1/roles/admin')).toHaveLength(1));
    expect(api.callsTo('PATCH /api/v1/roles/admin')[0].body).not.toHaveProperty('permissions');
  });

  it('sin roles:manage es de solo lectura', async () => {
    setupApi();
    renderWithProviders(<RolesPage />, {
      auth: { user: makeProfile({ permissions: ['roles:read'] }) },
    });
    await screen.findByRole('heading', { name: 'Auditor' });

    expect(screen.queryByRole('button', { name: 'Nuevo rol' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Editar el rol/ })).not.toBeInTheDocument();
  });

  it('muestra el error de carga y permite reintentar', async () => {
    let attempts = 0;
    setupApi({
      'GET /api/v1/roles': () =>
        ++attempts === 1 ? problem(500, 'boom', 'x') : { json: [viewer] },
    });
    renderWithProviders(<RolesPage />);

    expect(await screen.findByText('No se pudieron cargar los roles')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Reintentar' }));

    expect(await screen.findByRole('heading', { name: 'Consulta' })).toBeInTheDocument();
  });
});
