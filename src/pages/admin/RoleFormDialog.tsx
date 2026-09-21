import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, Checkbox, Dialog, TextField } from '@/components';
import { createRole, updateRole } from '@/services/rolesService';
import type { PermissionInfo, Role } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { roleCreateSchema, roleEditSchema } from '@/utils/validation';
import type { z } from 'zod';

type CreateForm = z.infer<typeof roleCreateSchema>;

interface RoleFormDialogProps {
  open: boolean;
  /** `null` = crear un rol nuevo; un rol = editarlo. */
  role: Role | null;
  permissions: readonly PermissionInfo[];
  onClose: () => void;
  onSaved: (saved: Role) => void;
}

/** Crear o editar un rol y elegir sus permisos. Los permisos del administrador están bloqueados. */
export function RoleFormDialog({ open, role, permissions, onClose, onSaved }: RoleFormDialogProps) {
  const isEdit = role !== null;
  const formId = 'role-form';
  const locked = role?.key === 'admin';
  const [selected, setSelected] = useState<Set<string>>(new Set(role?.permissions ?? []));
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(isEdit ? roleEditSchema : roleCreateSchema) as never,
    defaultValues: {
      key: role?.key ?? '',
      name: role?.name ?? '',
      description: role?.description ?? '',
    },
  });

  const toggle = (key: string) =>
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    const permissionList = [...selected];
    try {
      const saved = isEdit
        ? await updateRole(role.key, {
            name: values.name,
            description: values.description,
            ...(locked ? {} : { permissions: permissionList }),
          })
        : await createRole({ ...values, permissions: permissionList });
      onSaved(saved);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? `Editar rol "${role.name}"` : 'Nuevo rol'}
      maxWidth="md"
      actions={
        <>
          <Button variant="text" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear rol'}
          </Button>
        </>
      }
    >
      <Stack id={formId} component="form" spacing={2} noValidate onSubmit={onSubmit} sx={{ pt: 1 }}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {!isEdit && (
          <TextField
            label="Clave"
            maxLength={32}
            helperText="Identificador estable: minúsculas, números, - o _"
            error={errors.key?.message}
            {...register('key')}
          />
        )}
        <TextField
          label="Nombre"
          maxLength={60}
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Descripción"
          maxLength={200}
          error={errors.description?.message}
          {...register('description')}
        />

        <Stack component="fieldset" spacing={0.5} sx={{ border: 0, p: 0, m: 0 }}>
          <Typography component="legend" variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Permisos
          </Typography>
          {locked && (
            <Alert severity="info">
              El administrador siempre tiene todos los permisos; no se pueden modificar.
            </Alert>
          )}
          {permissions.map((permission) => (
            <Checkbox
              key={permission.key}
              label={
                <span>
                  <strong>{permission.key}</strong> — {permission.description}
                </span>
              }
              checked={locked || selected.has(permission.key)}
              disabled={locked}
              onChange={() => toggle(permission.key)}
            />
          ))}
        </Stack>
      </Stack>
    </Dialog>
  );
}
