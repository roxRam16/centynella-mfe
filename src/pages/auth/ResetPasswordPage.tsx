import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, Link, PasswordField } from '@/components';
import type { RedirectState } from '@/routes/guards';
import { resetPassword } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { resetPasswordSchema } from '@/utils/validation';
import type { z } from 'zod';

type ResetForm = z.infer<typeof resetPasswordSchema>;

/** Nueva contraseña con el token del enlace del correo (`/reset-password?token=…`). */
export function ResetPasswordPage() {
  const token = useSearchParams()[0].get('token');
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetForm>({ resolver: zodResolver(resetPasswordSchema) });

  const onSubmit = handleSubmit(async ({ password }) => {
    if (!token) return;
    setServerError(null);
    try {
      await resetPassword(token, password);
      const state: RedirectState = {
        notice: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.',
      };
      navigate('/login', { state, replace: true });
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
              placeholder="8+ caracteres, letras y números"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register('password')}
            />
            <PasswordField
              label="Confirmar contraseña"
              autoComplete="new-password"
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
