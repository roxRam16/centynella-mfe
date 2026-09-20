import { HttpError } from '@/services/httpClient';

/** Mensajes en español para los códigos estables del backend (`code` del Problem Details). */
const MESSAGES_BY_CODE: Record<string, string> = {
  invalid_credentials: 'Correo o contraseña incorrectos.',
  account_disabled: 'Tu cuenta está deshabilitada. Contacta a un administrador.',
  email_taken: 'Ya existe una cuenta con ese correo.',
  registration_disabled: 'El registro de nuevas cuentas está deshabilitado.',
  invalid_reset_token: 'El enlace no es válido o ya expiró. Solicita uno nuevo.',
  invalid_current_password: 'La contraseña actual es incorrecta.',
  last_admin: 'Debe existir al menos un administrador activo.',
  self_modification: 'No puedes cambiar tu propio rol o estado, ni eliminar tu cuenta.',
  role_in_use: 'El rol tiene usuarios asignados; reasígnalos antes de eliminarlo.',
  role_exists: 'Ya existe un rol con esa clave.',
  role_not_found: 'El rol seleccionado no existe.',
  system_role: 'Los roles de sistema no se pueden eliminar.',
  admin_role_locked: 'Los permisos del administrador no se pueden modificar.',
  insufficient_permissions: 'No tienes permiso para realizar esta acción.',
  google_not_available: 'El acceso con Google todavía no está disponible.',
};

/**
 * Convierte cualquier error en un mensaje entendible para la persona usuaria.
 * Orden: código conocido → bloqueo temporal → detalle del backend → mensaje por defecto.
 */
export function getErrorMessage(
  error: unknown,
  fallback = 'Ocurrió un error inesperado. Intenta de nuevo.',
): string {
  if (error instanceof HttpError) {
    if (error.code === 'account_locked') {
      const minutes = error.retryAfter ? Math.ceil(error.retryAfter / 60) : undefined;
      return minutes
        ? `Demasiados intentos fallidos. Intenta de nuevo en ${minutes} minuto${minutes === 1 ? '' : 's'}.`
        : 'Demasiados intentos fallidos. Intenta de nuevo más tarde.';
    }
    if (error.code && MESSAGES_BY_CODE[error.code]) return MESSAGES_BY_CODE[error.code];
    if (error.status === 422) return 'Revisa los datos ingresados.';
    if (error.status >= 500) return 'El servidor no pudo procesar la solicitud. Intenta más tarde.';
    if (error.problem?.detail) return error.problem.detail;
    return fallback;
  }
  if (error instanceof TypeError) {
    return 'No se pudo conectar con el servidor. Revisa tu conexión.'; // fetch falla con TypeError
  }
  return fallback;
}
