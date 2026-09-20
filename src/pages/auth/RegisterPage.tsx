import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import {
  Alert,
  Button,
  GoogleButton,
  Link,
  PasswordField,
  PasswordRequirements,
  TextField,
} from '@/components';
import { useAuth } from '@/hooks/useAuth';
import type { RedirectState } from '@/routes/guards';
import { register as registerAccount } from '@/services/authService';
import { getErrorMessage } from '@/utils/errors';
import { registerSchema } from '@/utils/validation';
import type { z } from 'zod';

type RegisterForm = z.infer<typeof registerSchema>;

/** Registro de una cuenta nueva. Si todo sale bien, inicia sesión automáticamente. */
export function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });
  const password = useWatch({ control, name: 'password' }) ?? '';

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null);
    try {
      await registerAccount({ name, email, password });
    } catch (error) {
      setServerError(getErrorMessage(error));
      return;
    }
    try {
      await login({ email, password }); // PublicOnly redirige al inicio
    } catch {
      const state: RedirectState = {
        notice: 'Tu cuenta fue creada. Inicia sesión para continuar.',
      };
      navigate('/login', { state, replace: true });
    }
  });

  return (
    <Stack component="section" spacing={2.5} aria-labelledby="titulo-registro">
      <Typography id="titulo-registro" component="h1" variant="h2" sx={{ fontWeight: 700 }}>
        Crear cuenta
      </Typography>

      {serverError && <Alert severity="error">{serverError}</Alert>}

      <Stack component="form" spacing={2} noValidate onSubmit={onSubmit}>
        <TextField
          label="Nombre"
          autoComplete="name"
          maxLength={80}
          error={errors.name?.message}
          {...register('name')}
        />
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
          Registrarme
        </Button>
      </Stack>

      <Typography variant="body2" color="text.secondary">
        ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
      </Typography>

      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          Crear cuenta con
        </Typography>
        <GoogleButton disabled />
      </Stack>
    </Stack>
  );
}
