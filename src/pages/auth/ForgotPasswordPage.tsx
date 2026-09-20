import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, Link, TextField } from '@/components';
import { requestPasswordReset } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { forgotPasswordSchema } from '@/utils/validation';
import type { z } from 'zod';

type ForgotForm = z.infer<typeof forgotPasswordSchema>;

/**
 * Solicitud de recuperación de contraseña. El mensaje de éxito es el mismo exista o no la
 * cuenta (igual que el backend), para no revelar qué correos están registrados.
 */
export function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotForm>({ resolver: zodResolver(forgotPasswordSchema) });

  const onSubmit = handleSubmit(async ({ email }) => {
    setServerError(null);
    try {
      await requestPasswordReset(email);
      setSent(true);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="section" spacing={2.5} aria-labelledby="titulo-recuperar">
      <Typography id="titulo-recuperar" component="h1" variant="h2" sx={{ fontWeight: 700 }}>
        Recuperar contraseña
      </Typography>
      <Typography color="text.secondary">
        Escribe tu correo y te enviaremos un enlace para crear una contraseña nueva.
      </Typography>

      {sent ? (
        <Alert severity="success" title="Revisa tu correo">
          Si el correo está registrado, te enviamos un enlace que vence en 60 minutos.
        </Alert>
      ) : (
        <>
          {serverError && <Alert severity="error">{serverError}</Alert>}
          <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit}>
            <TextField
              label="Correo electrónico"
              type="email"
              autoComplete="email"
              error={errors.email?.message}
              {...register('email')}
            />
            <Button type="submit" fullWidth loading={isSubmitting}>
              Enviar enlace
            </Button>
          </Stack>
        </>
      )}

      <Link to="/login">Volver a iniciar sesión</Link>
    </Stack>
  );
}
