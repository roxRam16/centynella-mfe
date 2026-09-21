import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, Link, PasswordField, PasswordRequirements } from '@/components';
import { useToast } from '@/hooks/useToast';
import { resetPassword } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { resetPasswordSchema } from '@/utils/validation';
import type { z } from 'zod';

type ResetForm = z.infer<typeof resetPasswordSchema>;

/** Nueva contraseña con el token del enlace del correo (`/reset-password?token=…`). */
export function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetPasswordSchema) });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) return;
    setServerError(null);
    try {
      await resetPassword(token, password);
      toast.success('Tu contraseña fue actualizada. Ya puedes iniciar sesión.');
      navigate('/login', { replace: true });
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="section" spacing={2.5} aria-labelledby="titulo-restablecer">
      <Typography id="titulo-restablecer" component="h1" variant="h2" sx={{ fontWeight: 700 }}>
        Nueva contraseña
      </Typography>

      {!token ? (
        <Alert severity="error" title="Enlace incompleto">
          Este enlace no es válido. <Link to="/forgot-password">Solicita uno nuevo</Link>.
        </Alert>
      ) : (
        <>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit}>
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
              label="Confirmar contraseña"
              autoComplete="new-password"
              maxLength={128}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Guardar contraseña
            </Button>
          </Stack>
        </>
      )}

      <Link to="/login">Volver a iniciar sesión</Link>
    </Stack>
  );
}
