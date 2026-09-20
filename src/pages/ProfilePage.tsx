import { useState } from 'react';
import { useForm } from 'react-hook-form';
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
  Spinner,
  Tabs,
  TextField,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
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
  const [saved, setSaved] = useState(false);
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
    setSaved(false);
    setServerError(null);
    try {
      updateUser(await updateProfile(name));
      setSaved(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
      {saved && <Alert severity="success">Tus datos se guardaron.</Alert>}
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <TextField
        label="Nombre"
        autoComplete="name"
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
  const [saved, setSaved] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(changePasswordSchema) });

  const onSubmit = handleSubmit(async ({ currentPassword, password }) => {
    setSaved(false);
    setServerError(null);
    try {
      setSession(await changePassword(currentPassword, password));
      reset();
      setSaved(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit} sx={{ maxWidth: 480 }}>
      {saved && (
        <Alert severity="success">
          Contraseña actualizada. Cerramos tus sesiones en otros dispositivos.
        </Alert>
      )}
      {serverError && <Alert severity="error">{serverError}</Alert>}
      <PasswordField
        label="Contraseña actual"
        autoComplete="current-password"
        error={errors.currentPassword?.message}
        {...register('currentPassword')}
      />
      <PasswordField
        label="Contraseña nueva"
        placeholder="8+ caracteres, letras y números"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
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
