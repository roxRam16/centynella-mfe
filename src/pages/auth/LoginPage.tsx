import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Alert, Button, GoogleButton, Link, PasswordField, TextField } from '@/components';
import { APP_LABEL } from '@/config/version';
import { useAuth } from '@/hooks/useAuth';
import type { RedirectState } from '@/routes/guards';
import { getErrorMessage } from '@/utils/errors';
import { loginSchema } from '@/utils/validation';
import type { z } from 'zod';

type LoginForm = z.infer<typeof loginSchema>;

/**
 * Inicio de sesión (diseño de mockups/login.png). Tras entrar, `PublicOnly` redirige a la
 * página que la persona quería abrir (o al inicio).
 */
export function LoginPage() {
  const { login } = useAuth();
  const notice = (useLocation().state as RedirectState | null)?.notice;
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login(values);
    } catch (error) {
      setServerError(getErrorMessage(error));
    }
  });

  return (
    <Stack component="section" spacing={2.5} aria-labelledby="titulo-login">
      <Typography id="titulo-login" component="h1" variant="h2" sx={{ fontWeight: 700 }}>
        Bienvenido
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: -1.5 }}>
        {APP_LABEL}
      </Typography>

      {notice && <Alert severity="success">{notice}</Alert>}
      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Stack component="form" spacing={2.5} noValidate onSubmit={onSubmit}>
        <TextField
          label="Correo electrónico"
          type="email"
          autoComplete="email"
          maxLength={254}
          error={errors.email?.message}
          {...register('email')}
        />
        <PasswordField
          label="Contraseña"
          placeholder="8+ caracteres"
          autoComplete="current-password"
          maxLength={128}
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Entrar
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        ¿Olvidaste la contraseña? <Link to="/forgot-password">Recupérala aquí</Link>
      </Typography>

      <Box>
        <Link to="/register">Registrarse</Link>
      </Box>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Crear cuenta con
        </Typography>
        <GoogleButton disabled />
      </Stack>
    </Stack>
  );
}
