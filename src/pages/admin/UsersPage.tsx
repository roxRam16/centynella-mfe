import { useCallback, useMemo, useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircleOutline';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import { Alert, Avatar, Button, Chip, ConfirmDialog, IconButton, ModulePage } from '@/components';
import type { Column, FilterField, FilterValues } from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuth } from '@/hooks/useAuth';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useToast } from '@/hooks/useToast';
import { listRoles } from '@/services/rolesService';
import { PERMISSIONS } from '@/services/types';
import type { Role, User, UserStatus } from '@/services/types';
import { deleteUser, listUsers } from '@/services/usersService';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';
import { UserFormDialog } from './UserFormDialog';

/** Tamaño de página inicial (el selector ofrece 10, 20, 50 y 100). */
const DEFAULT_PAGE_SIZE = 10;

/**
 * Administración de usuarios sobre la plantilla `ModulePage`: buscador principal por nombre o
 * correo; rol y estado viven en el filtro avanzado (oculto hasta activarlo); botonera con
 * nuevo, actualizar, filtro y acciones (vista tabla/tarjetas).
 */
export function UsersPage() {
  const { user: me, hasPermission } = useAuth();
  const toast = useToast();
  const canCreate = hasPermission(PERMISSIONS.USERS_CREATE);
  const canUpdate = hasPermission(PERMISSIONS.USERS_UPDATE);
  const canDelete = hasPermission(PERMISSIONS.USERS_DELETE);
  const canReadRoles = hasPermission(PERMISSIONS.ROLES_READ);

  const [search, setSearch] = useState('');
  const [advanced, setAdvanced] = useState<FilterValues>({});
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [editing, setEditing] = useState<User | 'new' | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const q = useDebouncedValue(search.trim());
  const filters = useMemo(
    () => ({
      q,
      role: advanced.role ?? '',
      status: (advanced.status ?? '') as UserStatus | '',
      page,
      page_size: pageSize,
    }),
    [q, advanced, page, pageSize],
  );
  const fetchUsers = useCallback((signal: AbortSignal) => listUsers(filters, signal), [filters]);
  const users = useAsyncResource(fetchUsers);

  // Los roles requieren `roles:read`; sin él el filtro de rol no se ofrece y se muestra la clave.
  const fetchRoles = useCallback(
    (signal: AbortSignal): Promise<Role[]> =>
      canReadRoles ? listRoles(signal) : Promise.resolve([]),
    [canReadRoles],
  );
  const roles = useAsyncResource(fetchRoles);
  const roleData = roles.status === 'success' ? roles.data : undefined;
  const roleOptions = useMemo(
    () => (roleData ?? []).map((role) => ({ value: role.key, label: role.name })),
    [roleData],
  );
  const roleName = (key: string) => roleData?.find((role) => role.key === key)?.name ?? key;

  const filterFields = useMemo<FilterField[]>(
    () => [
      ...(canReadRoles
        ? [{ key: 'role', label: 'Rol', type: 'select' as const, options: roleOptions }]
        : []),
      {
        key: 'status',
        label: 'Estado',
        type: 'select' as const,
        options: [
          { value: 'active', label: 'Activos' },
          { value: 'disabled', label: 'Deshabilitados' },
        ],
      },
    ],
    [canReadRoles, roleOptions],
  );

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteUser(deleting.id);
      setDeleting(null);
      users.reload();
      toast.success(`Usuario "${deleting.name}" eliminado correctamente`);
    } catch (error) {
      setDeleting(null);
      toast.error(getErrorMessage(error), { title: 'No se pudo eliminar el usuario' });
    } finally {
      setDeleteBusy(false);
    }
  };

  const columns: Column<User>[] = [
    {
      key: 'user',
      header: 'Usuario',
      primary: true,
      render: (row) => (
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', minWidth: 0 }}>
          <Avatar name={row.name} />
          <Stack sx={{ minWidth: 0 }}>
            <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
              {row.name}
            </Typography>
            <Typography variant="caption" noWrap color="text.secondary">
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
      kind: 'actions',
      render: (row) => (
        <Stack direction="row" spacing={0.5} sx={{ justifyContent: 'flex-end' }}>
          {canUpdate && (
            <IconButton
              label={`Editar a ${row.name}`}
              icon={<EditIcon fontSize="small" />}
              tone="primary"
              onClick={() => setEditing(row)}
            />
          )}
          {canDelete && (
            <IconButton
              label={`Eliminar a ${row.name}`}
              icon={<DeleteIcon fontSize="small" />}
              tone="danger"
              disabled={row.id === me?.id}
              onClick={() => setDeleting(row)}
            />
          )}
        </Stack>
      ),
    },
  ];

  const rows = users.status === 'success' ? users.data.items : [];
  const total = users.status === 'success' ? users.data.total : 0;

  return (
    <ModulePage
      moduleKey="users"
      title="Usuarios"
      description="Administra las cuentas, sus roles y su estado."
      search={{
        label: 'Buscar usuarios',
        placeholder: 'Buscar por nombre o correo…',
        value: search,
        onChange: (value) => {
          setSearch(value);
          setPage(1);
        },
      }}
      onNew={canCreate ? () => setEditing('new') : undefined}
      newLabel="Nuevo usuario"
      onRefresh={users.reload}
      refreshing={users.status === 'loading'}
      filters={{
        fields: filterFields,
        values: advanced,
        onApply: (values) => {
          setAdvanced(values);
          setPage(1);
        },
      }}
      notice={
        users.status === 'error' && (
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
        )
      }
      table={{
        caption: 'Listado de usuarios',
        columns,
        rows,
        getRowId: (row) => row.id,
        getRowLabel: (row) => row.name,
        loading: users.status === 'loading',
        emptyMessage: 'No hay usuarios que coincidan con los filtros.',
        pagination: {
          page,
          pageSize,
          total,
          onPageChange: setPage,
          onPageSizeChange: (size) => {
            setPageSize(size);
            setPage(1);
          },
        },
      }}
    >
      {editing !== null && (
        <UserFormDialog
          open
          user={editing === 'new' ? null : editing}
          roleOptions={roleOptions}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            toast.success(
              `Usuario "${saved.name}" ${editing === 'new' ? 'creado' : 'actualizado'} correctamente`,
            );
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
    </ModulePage>
  );
}
