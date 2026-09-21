import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  Card,
  Chip,
  PageHeader,
  PasswordField,
  PasswordRequirements,
  Spinner,
  Tabs,
  TextField,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { changePassword, updateProfile } from '@/services/authService';
import type { Profile } from '@/services/types';
import { getErrorMessage } from '@/utils/errors';
import { formatDateTime } from '@/utils/format';
import { changePasswordSchema, profileSchema } from '@/utils/validation';
import type { z } from 'zod';

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof changePasswordSchema>;

/** Mi perfil: datos personales y seguridad (cambio de contraseña). */
export function ProfilePage() {
  const { user } = useAuth();
  if (!user) return <Spinner />;

  return (
    <>
      <PageHeader title="Mi perfil" description="Administra tu información y tu contraseña." />
      <Card>
        <Tabs
          ariaLabel="Secciones del perfil"
          items={[
            { id: 'data', label: 'Datos personales', content: <PersonalDataForm user={user} /> },
            { id: 'security', label: 'Seguridad', content: <ChangePasswordForm /> },
          ]}
        />
      </Card>
    </>
  );
}

function PersonalDataForm({ user }: { user: Profile }) {
  const { updateUser } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user.name },
  });

  const onSubmit = handleSubmit(async ({ name }) => {
    setServerError(null);
    try {
      updateUser(await updateProfile(name));
      toast.success('Datos personales guardados correctamente');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <TextField
        label="Nombre"
        autoComplete="name"
        maxLength={80}
        error={errors.name?.message}
        {...register('name')}
      />
      <TextField
        label="Correo electrónico"
        value={user.email}
        disabled
        readOnly
        helperText="El correo no se puede cambiar."
      />
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Rol:
        </Typography>
        <Chip label={user.role} tone="primary" />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        Último acceso: {formatDateTime(user.last_login_at)}
      </Typography>
      <Button type="submit" loading={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
        Guardar cambios
      </Button>
    </Stack>
  );
}

function ChangePasswordForm() {
  const { setSession } = useAuth();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(changePasswordSchema) });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit(async ({ currentPassword, password }) => {
    setServerError(null);
    try {
      setSession(await changePassword(currentPassword, password));
      reset();
      toast.success('Contraseña actualizada. Cerramos tus sesiones en otros dispositivos.');
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <PasswordField
        label="Contraseña actual"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <PasswordField
        label="Contraseña nueva"
        placeholder="8+ caracteres"
        autoComplete="new-password"
        maxLength={128}
        error={errors.password?.message}
        {...register('password')}
      />
      <PasswordRequirements password={password} />
      <PasswordField
        label="Confirmar contraseña nueva"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" loading={isSubmitting} sx={{ alignSelf: 'flex-start' }}>
        Cambiar contraseña
      </Button>
    </Stack>
  );
}
