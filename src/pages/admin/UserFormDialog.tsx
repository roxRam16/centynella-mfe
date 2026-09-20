import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import {
  Alert,
  Button,
  Dialog,
  PasswordField,
  PasswordRequirements,
  Select,
  TextField,
} from '@/components';
import type { SelectOption } from '@/components';
import { createUser, updateUser } from '@/services/usersService';
import type { User } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { userCreateSchema, userEditSchema } from '@/utils/validation';
import type { z } from 'zod';

type CreateForm = z.infer<typeof userCreateSchema>;
type EditForm = z.infer<typeof userEditSchema>;

const STATUS_OPTIONS: SelectOption[] = [
  { value: 'active', label: 'Activo' },
  { value: 'disabled', label: 'Deshabilitado' },
];

interface UserFormDialogProps {
  open: boolean;
  /** `null` = crear un usuario nuevo; un usuario = editarlo. */
  user: User | null;
  roleOptions: readonly SelectOption[];
  onClose: () => void;
  onSaved: () => void;
}

/** Crear o editar un usuario (administración). Los errores del backend se muestran en el diálogo. */
export function UserFormDialog({ open, user, roleOptions, onClose, onSaved }: UserFormDialogProps) {
  const isEdit = user !== null;
  const formId = 'user-form';
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<CreateForm>({
    resolver: zodResolver(isEdit ? userEditSchema : userCreateSchema) as never,
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? roleOptions.find((option) => option.value === 'viewer')?.value ?? '',
      status: user?.status ?? 'active',
    },
  });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (isEdit) {
        const changes: EditForm = { name: values.name, role: values.role, status: values.status };
        await updateUser(user.id, changes);
      } else {
        await createUser(values);
      }
      onSaved();
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar usuario' : 'Nuevo usuario'}
      actions={
        <>
          <Button variant="text" onClick={onClose} disabled={isSubmitting}>
            Cancelar
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </>
      }
    >
      <Stack id={formId} component="form" spacing={2} noValidate onSubmit={onSubmit} sx={{ pt: 1 }}>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        <TextField
          label="Nombre"
          maxLength={80}
          error={errors.name?.message}
          {...register('name')}
        />
        <TextField
          label="Correo electrónico"
          type="email"
          maxLength={254}
          disabled={isEdit}
          error={errors.email?.message}
          {...register('email')}
        />
        {!isEdit && (
          <PasswordField
            label="Contraseña inicial"
            placeholder="8+ caracteres"
            autoComplete="new-password"
            maxLength={128}
            error={errors.password?.message}
            {...register('password')}
          />
        )}
        {!isEdit && <PasswordRequirements password={password} />}
        <Select
          label="Rol"
          options={roleOptions}
          placeholder="Selecciona un rol"
          error={errors.role?.message}
          {...register('role')}
        />
        <Select label="Estado" options={STATUS_OPTIONS} {...register('status')} />
      </Stack>
    </Dialog>
  );
}
