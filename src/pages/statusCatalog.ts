/**
 * Catálogo de códigos HTTP con mensajes amables. Un lugar único: `StatusPage` lo consume y
 * cualquier código no listado cae en un mensaje genérico según su clase (4xx o 5xx).
 */

export type StatusIcon = 'notFound' | 'lock' | 'error' | 'cloud' | 'time' | 'payment' | 'block';

export interface StatusInfo {
  title: string;
  message: string;
  icon: StatusIcon;
  /** Tiene sentido "Reintentar" (fallo temporal). */
  retry?: boolean;
  /** La acción principal es iniciar sesión. */
  login?: boolean;
}

export const STATUS_CATALOG: Record<number, StatusInfo> = {
  400: {
    title: 'Solicitud incorrecta',
    message: 'No pudimos entender la solicitud. Revisa los datos e intenta de nuevo.',
    icon: 'error',
  },
  401: {
    title: 'Necesitas iniciar sesión',
    message: 'Tu sesión no es válida o expiró. Inicia sesión para continuar.',
    icon: 'lock',
    login: true,
  },
  402: {
    title: 'Pago requerido',
    message: 'Esta función requiere un plan activo. Contacta a un administrador.',
    icon: 'payment',
  },
  403: {
    title: 'Acceso restringido',
    message:
      'No tienes permiso para ver esta sección. Si crees que es un error, contacta a un administrador.',
    icon: 'lock',
  },
  404: {
    title: 'Página no encontrada',
    message: 'La dirección que buscas no existe o fue movida. Revisa que esté bien escrita.',
    icon: 'notFound',
  },
  405: {
    title: 'Acción no permitida',
    message: 'Esta acción no está permitida para este recurso.',
    icon: 'block',
  },
  408: {
    title: 'Tiempo de espera agotado',
    message: 'La solicitud tardó demasiado. Intenta de nuevo.',
    icon: 'time',
    retry: true,
  },
  409: {
    title: 'Conflicto',
    message:
      'La acción entra en conflicto con el estado actual. Actualiza la página e intenta de nuevo.',
    icon: 'block',
  },
  410: {
    title: 'Ya no está disponible',
    message: 'Este contenido fue eliminado y no volverá a estar disponible.',
    icon: 'notFound',
  },
  413: {
    title: 'Archivo o solicitud demasiado grande',
    message: 'Lo que intentas enviar supera el tamaño permitido.',
    icon: 'block',
  },
  422: {
    title: 'Datos no válidos',
    message: 'Algunos datos no cumplen lo esperado. Corrígelos e intenta de nuevo.',
    icon: 'error',
  },
  429: {
    title: 'Demasiados intentos',
    message: 'Hiciste muchas solicitudes seguidas. Espera un momento y vuelve a intentar.',
    icon: 'time',
    retry: true,
  },
  500: {
    title: 'Algo salió mal',
    message:
      'Tuvimos un problema de nuestro lado. Intenta de nuevo en unos minutos; si persiste, avisa a un administrador.',
    icon: 'error',
    retry: true,
  },
  501: {
    title: 'Aún no disponible',
    message: 'Esta función todavía no está implementada.',
    icon: 'block',
  },
  502: {
    title: 'Servicio no disponible',
    message: 'Un servicio del que dependemos no respondió bien. Intenta de nuevo en unos minutos.',
    icon: 'cloud',
    retry: true,
  },
  503: {
    title: 'Estamos en mantenimiento',
    message: 'El sistema no está disponible por ahora. Vuelve a intentarlo en unos minutos.',
    icon: 'cloud',
    retry: true,
  },
  504: {
    title: 'El servidor tardó en responder',
    message: 'El servicio tardó demasiado en responder. Intenta de nuevo.',
    icon: 'cloud',
    retry: true,
  },
};

const GENERIC_CLIENT: StatusInfo = {
  title: 'No se pudo completar la solicitud',
  message: 'Ocurrió un problema con la solicitud. Intenta de nuevo o vuelve al inicio.',
  icon: 'error',
};

const GENERIC_SERVER: StatusInfo = {
  title: 'Error del servidor',
  message: 'Tuvimos un problema de nuestro lado. Intenta de nuevo en unos minutos.',
  icon: 'error',
  retry: true,
};

/** Mensaje para un código; los no catalogados usan uno genérico por clase (4xx / 5xx). */
export function getStatusInfo(code: number): StatusInfo {
  return STATUS_CATALOG[code] ?? (code >= 500 ? GENERIC_SERVER : GENERIC_CLIENT);
}

/** ¿Es un código de error HTTP mostrable (400-599)? */
export function isErrorStatus(code: number): boolean {
  return Number.isInteger(code) && code >= 400 && code <= 599;
}
