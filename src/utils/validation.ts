/**
 * Esquemas de validación de formularios (zod). Reflejan las reglas del backend para dar
 * feedback inmediato; el backend sigue siendo la autoridad y su error también se muestra.
 *
 * Seguridad de entradas:
 *  · Correo: patrón estricto (debe llevar @, sin espacios, comillas ni < >).
 *  · Nombres y textos libres: sin marcado HTML (< >) ni caracteres de control.
 *  · Contraseña: mayúscula, minúscula, número y símbolo. Se guarda como hash y nunca se muestra.
 *  · Además, React escapa todo lo que se pinta en pantalla: un texto como `<script>` se vería
 *    como texto plano, nunca se ejecutaría.
 */
import { z } from 'zod';

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

// Patrón conservador (igual que el del backend): letras/números y . _ % + - antes de la @.
const STRICT_EMAIL = /^[A-Za-z0-9._%+-]{1,64}@[A-Za-z0-9-]+(\.[A-Za-z0-9-]+)+$/;
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\x00-\x1f\x7f]/;

export const emailSchema = z
  .string()
  .trim()
  .min(1, 'Ingresa tu correo electrónico')
  .max(254, 'Máximo 254 caracteres')
  .refine((value) => value === '' || value.includes('@'), 'El correo debe incluir @')
  .regex(STRICT_EMAIL, 'Ingresa un correo válido, sin espacios ni caracteres especiales');

/** Requisito de contraseña: se usa para validar Y para mostrar el checklist en vivo. */
export interface PasswordRule {
  id: string;
  /** Texto corto del checklist ("Una mayúscula"). */
  label: string;
  /** Mensaje de error cuando no se cumple. */
  message: string;
  test: (password: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: 'length',
    label: `Al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    message: `Usa al menos ${MIN_PASSWORD_LENGTH} caracteres`,
    test: (password) => password.length >= MIN_PASSWORD_LENGTH,
  },
  {
    id: 'upper',
    label: 'Una mayúscula',
    message: 'Incluye al menos una mayúscula',
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: 'lower',
    label: 'Una minúscula',
    message: 'Incluye al menos una minúscula',
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: 'digit',
    label: 'Un número',
    message: 'Incluye al menos un número',
    test: (password) => /\d/.test(password),
  },
  {
    id: 'symbol',
    label: 'Un símbolo (! @ # $ % …)',
    message: 'Incluye al menos un símbolo (! @ # $ % …)',
    test: (password) => /[^A-Za-z0-9\s]/.test(password),
  },
  {
    id: 'no-spaces',
    label: 'Sin espacios',
    message: 'No puede contener espacios',
    test: (password) => !/\s/.test(password) && !CONTROL_CHARS.test(password),
  },
];

/** Estado de cada requisito para una contraseña (alimenta el checklist visual). */
export function evaluatePasswordRules(password: string): { rule: PasswordRule; met: boolean }[] {
  return PASSWORD_RULES.map((rule) => ({ rule, met: rule.test(password) }));
}

/** Contraseña NUEVA (registro, cambio, recuperación): cumple todos los requisitos. */
export const newPasswordSchema = PASSWORD_RULES.reduce<z.ZodString>(
  (schema, rule) => schema.refine(rule.test, rule.message),
  z.string().max(MAX_PASSWORD_LENGTH, `Máximo ${MAX_PASSWORD_LENGTH} caracteres`),
);

/** Solo letras (cualquier idioma), espacios, apóstrofes, puntos y guiones; empieza con letra. */
export const nameSchema = z
  .string()
  .trim()
  .min(2, 'Escribe tu nombre (mínimo 2 caracteres)')
  .max(80, 'Máximo 80 caracteres')
  .regex(
    /^\p{L}[\p{L}\p{M} '.-]*$/u,
    'El nombre solo admite letras, espacios, apóstrofes, puntos y guiones',
  );

/** Texto libre corto (nombre/descripción de un rol…): sin HTML ni caracteres de control. */
const safeText = (min: number, max: number, minMessage: string) =>
  z
    .string()
    .trim()
    .min(min, minMessage)
    .max(max, `Máximo ${max} caracteres`)
    .refine(
      (value) => !/[<>]/.test(value) && !CONTROL_CHARS.test(value),
      'No se permiten los caracteres < >',
    );

const passwordsMatch = (data: { password: string; confirmPassword: string }) =>
  data.password === data.confirmPassword;
const mismatchMessage = { message: 'Las contraseñas no coinciden', path: ['confirmPassword'] };

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .min(1, 'Ingresa tu contraseña')
    .max(MAX_PASSWORD_LENGTH, 'Contraseña demasiado larga'),
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
  name: safeText(2, 60, 'Mínimo 2 caracteres'),
  description: safeText(0, 200, ''),
});

export const roleEditSchema = z.object({
  name: safeText(2, 60, 'Mínimo 2 caracteres'),
  description: safeText(0, 200, ''),
});
