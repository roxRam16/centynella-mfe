import { useCallback, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Avatar,
  Button,
  Chip,
  ConfirmDialog,
  DataTable,
  PageHeader,
  Pagination,
  Select,
  TextField,
} from '@/components';
import type { Column, SelectOption } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { listRoles } from '@/services/rolesService';
import { PERMISSIONS } from '@/services/types';
import type { Role, User, UserStatus } from '@/services/types';
import { deleteUser, listUsers } from '@/services/usersService';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';
import { UserFormDialog } from './UserFormDialog';

const PAGE_SIZE = 10;

const STATUS_FILTER: SelectOption[] = [
  { value: 'active', label: 'Activos' },
  { value: 'disabled', label: 'Deshabilitados' },
];

/** Administración de usuarios: búsqueda, filtros, paginación, crear, editar y eliminar. */
export function UsersPage() {
  const { user: me, hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USERS_DELETE);
  const canReadRoles = hasPermission(PERMISSIONS.ROLES_READ);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | ''>('');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const q = useDebouncedValue(search.trim());
  const filters = useMemo(
    () => ({ q, role: roleFilter, status: statusFilter, page, page_size: PAGE_SIZE }),
    [q, roleFilter, statusFilter, page],
  );
  const fetchUsers = useCallback((signal: AbortSignal) => listUsers(filters, signal), [filters]);
  const users = useAsyncResource(fetchUsers);

  // Los roles requieren `roles:read`; sin él el selector no se llena y se muestra la clave del rol.
  const fetchRoles = useCallback(
    (signal: AbortSignal): Promise<Role[]> =>
      canReadRoles ? listRoles(signal) : Promise.resolve([]),
    [canReadRoles],
  );
  const roles = useAsyncResource(fetchRoles);
  const roleData = roles.status === 'success' ? roles.data : undefined;
  const roleOptions = useMemo<SelectOption[]>(
    () => (roleData ?? []).map((role) => ({ value: role.key, label: role.name })),
    [roleData],
  );
  const roleName = (key: string) => roleData?.find((role) => role.key === key)?.name ?? key;

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    setActionError(null);
    try {
      await deleteUser(deleting.id);
      setDeleting(null);
      users.reload();
    } catch (error) {
      setDeleting(null);
      setActionError(getErrorMessage(error));
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Usuario',
      render: (row) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
          <Avatar name={row.name} />
          <Stack>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {row.email}
            </Typography>
          </Stack>
        </Stack>
      ),
    },
    {
      key: 'role',
      header: 'Rol',
      render: (row) => (
        <Chip label={roleName(row.role)} tone={row.role === 'admin' ? 'primary' : 'neutral'} />
      ),
    },
    {
      key: 'status',
      header: 'Estado',
      render: (row) =>
        row.status === 'active' ? (
          <Chip label="Activo" tone="success" icon={<CheckCircleIcon />} />
        ) : (
          <Chip label="Deshabilitado" tone="error" icon={<BlockIcon />} />
        ),
    },
    {
      key: 'last_login',
      header: 'Último acceso',
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {formatDateTime(row.last_login_at)}
        </Typography>
      ),
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          {canUpdate && (
            <Button
              variant="text"
              aria-label={`Editar a ${row.name}`}
              onClick={() => setEditing(row)}
            >
              Editar
            </Button>
          )}
          {canDelete && (
            <Button
              variant="text"
              danger
              aria-label={`Eliminar a ${row.name}`}
              disabled={row.id === me?.id}
              onClick={() => setDeleting(row)}
            >
              Eliminar
            </Button>
          )}
        </Stack>
      ),
    },
  ];

  const rows = users.status === 'success' ? users.data.items : [];
  const pageCount = users.status === 'success' ? Math.ceil(users.data.total / PAGE_SIZE) : 1;

  return (
    <>
      <PageHeader
        title="Usuarios"
        description="Administra las cuentas, sus roles y su estado."
        actions={
          canCreate && (
            <Button startIcon={<AddIcon />} onClick={() => setEditing('new')}>
              Nuevo usuario
            </Button>
          )
        }
      />

      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <TextField
            label="Buscar"
            type="search"
            placeholder="Nombre o correo"
            maxLength={100}
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
          {canReadRoles && (
            <Select
              label="Rol"
              options={roleOptions}
              placeholder="Todos"
              value={roleFilter}
              onChange={(event) => {
                setRoleFilter(event.target.value);
                setPage(1);
              }}
            />
          )}
          <Select
            label="Estado"
            options={STATUS_FILTER}
            placeholder="Todos"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value as UserStatus | '');
              setPage(1);
            }}
          />
        </Stack>

        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}
        {users.status === 'error' && (
          <Alert
            severity="error"
            title="No se pudo cargar el listado"
            action={
              <Button variant="text" onClick={users.reload}>
                Reintentar
              </Button>
            }
          >
            {getErrorMessage(users.error)}
          </Alert>
        )}

        <DataTable
          caption="Listado de usuarios"
          columns={columns}
          rows={rows}
          getRowId={(row) => row.id}
          loading={users.status === 'loading'}
          emptyMessage="No hay usuarios que coincidan con los filtros."
        />
        <Stack sx={{ alignItems: 'center' }}>
          <Pagination page={page} pageCount={pageCount} onChange={setPage} />
        </Stack>
      </Stack>

      {editing !== null && (
        <UserFormDialog
          open
          user={editing === 'new' ? null : editing}
          roleOptions={roleOptions}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            users.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar usuario"
        message={`¿Seguro que quieres eliminar a ${deleting?.name ?? ''}? Esta acción no se puede deshacer y cierra sus sesiones.`}
        confirmLabel="Eliminar"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
