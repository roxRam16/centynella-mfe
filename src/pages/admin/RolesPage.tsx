import { useState } from 'react';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import AddIcon from '@mui/icons-material/Add';
import {
  Alert,
  Button,
  Card,
  Chip,
  ConfirmDialog,
  Grid,
  GridItem,
  PageHeader,
  Spinner,
} from '@/components';
import { useAsyncResource } from '@/hooks/useAsyncResource';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { deleteRole, listPermissions, listRoles } from '@/services/rolesService';
import { PERMISSIONS } from '@/services/types';
import type { Role } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { RoleFormDialog } from './RoleFormDialog';

/** Roles y permisos: lista de roles con sus permisos; crear, editar y eliminar (con `roles:manage`). */
export function RolesPage() {
  const { hasPermission } = useAuth();
  const toast = useToast();
  const canManage = hasPermission(PERMISSIONS.ROLES_MANAGE);
  const roles = useAsyncResource(listRoles);
  const permissions = useAsyncResource(listPermissions);

  const [editing, setEditing] = useState<Role | 'new' | null>(null);
  const [deleting, setDeleting] = useState<Role | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);

  const confirmDelete = async () => {
    if (!deleting) return;
    setDeleteBusy(true);
    try {
      await deleteRole(deleting.key);
      setDeleting(null);
      roles.reload();
      toast.success(`Rol "${deleting.name}" eliminado correctamente`);
    } catch (error) {
      setDeleting(null);
      toast.error(getErrorMessage(error), { title: 'No se pudo eliminar el rol' });
    } finally {
      setDeleteBusy(false);
    }
  };

  const catalog = permissions.status === 'success' ? permissions.data : [];

  return (
    <>
      <PageHeader
        title="Roles y permisos"
        description="Un rol agrupa permisos. Los cambios aplican de inmediato a sus usuarios."
        actions={
          canManage && (
            <Button startIcon={<AddIcon />} onClick={() => setEditing('new')}>
              Nuevo rol
            </Button>
          )
        }
      />

      {roles.status === 'loading' && <Spinner label="Cargando roles…" />}
      {roles.status === 'error' && (
        <Alert
          severity="error"
          title="No se pudieron cargar los roles"
          action={
            <Button variant="text" onClick={roles.reload}>
              Reintentar
            </Button>
          }
        >
          {getErrorMessage(roles.error)}
        </Alert>
      )}

      {roles.status === 'success' && (
        <Grid spacing={3}>
          {roles.data.map((role) => (
            <GridItem key={role.key} md={6} lg={4}>
              <Card as="article">
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                  >
                    <Typography component="h2" variant="h3">
                      {role.name}
                    </Typography>
                    <Chip label={role.key} tone="primary" />
                    {role.is_system && <Chip label="Sistema" />}
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    {role.description || 'Sin descripción.'}
                  </Typography>
                  <Stack direction="row" spacing={0.5} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
                    {role.permissions.length === 0 ? (
                      <Typography variant="caption" color="text.secondary">
                        Sin permisos
                      </Typography>
                    ) : (
                      role.permissions.map((permission) => (
                        <Chip key={permission} label={permission} tone="info" />
                      ))
                    )}
                  </Stack>
                  {canManage && (
                    <Stack direction="row" spacing={0.5}>
                      <Button
                        variant="text"
                        aria-label={`Editar el rol ${role.name}`}
                        onClick={() => setEditing(role)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant="text"
                        danger
                        aria-label={`Eliminar el rol ${role.name}`}
                        disabled={role.is_system}
                        onClick={() => setDeleting(role)}
                      >
                        Eliminar
                      </Button>
                    </Stack>
                  )}
                </Stack>
              </Card>
            </GridItem>
          ))}
        </Grid>
      )}

      {editing !== null && (
        <RoleFormDialog
          open
          role={editing === 'new' ? null : editing}
          permissions={catalog}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            toast.success(
              `Rol "${saved.name}" ${editing === 'new' ? 'creado' : 'actualizado'} correctamente`,
            );
            setEditing(null);
            roles.reload();
          }}
        />
      )}

      <ConfirmDialog
        open={deleting !== null}
        title="Eliminar rol"
        message={`¿Seguro que quieres eliminar el rol "${deleting?.name ?? ''}"? Solo se puede si no tiene usuarios asignados.`}
        confirmLabel="Eliminar"
        danger
        loading={deleteBusy}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setDeleting(null)}
      />
    </>
  );
}
