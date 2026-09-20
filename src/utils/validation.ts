/**
 * Esquemas de validación de formularios (zod). Reflejan las reglas del backend para dar
 * feedback inmediato; el backend sigue siendo la autoridad y su error también se muestra.
 */
import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo electrónico')
  .pipe(z.email('Ingresa un correo válido'));

/** Contraseña nueva: 8+ caracteres con al menos una letra y un número (igual que el backend). */
export const newPasswordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres`)
  .max(128, 'Máximo 128 caracteres')
  .regex(/[A-Za-z]/, 'Incluye al menos una letra')
  .regex(/\d/, 'Incluye al menos un número');

export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre (mínimo 2 caracteres)')
  .max(80, 'Máximo 80 caracteres');

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;
const mismatchMessage = { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] };

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Ingresa tu contraseña'),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine(passwordsMatch, mismatchMessage);

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu contraseña'),
  })
  .refine(passwordsMatch, mismatchMessage);

export const profileSchema = z.object({ name: nameSchema });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Ingresa tu contraseña actual'),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, 'Confirma tu nueva contraseña'),
  })
  .refine(passwordsMatch, mismatchMessage);

export const userCreateSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: newPasswordSchema,
  role: z.string().min(1, 'Selecciona un rol'),
  status: z.enum(['active', 'disabled']),
});

export const userEditSchema = z.object({
  name: nameSchema,
  role: z.string().min(1, 'Selecciona un rol'),
  status: z.enum(['active', 'disabled']),
});

export const roleCreateSchema = z.object({
  key: z
    .string()
    .regex(
      /^[a-z][a-z0-9_-]{1,31}$/,
      'Usa minúsculas, números, - o _ (2 a 32 caracteres, empieza con letra)',
    ),
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres'),
});

export const roleEditSchema = z.object({
  name: z.string().trim().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(200, 'Máximo 200 caracteres'),
});
