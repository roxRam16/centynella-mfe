/** Contratos de la API de CENTYNELLA-CORE (espejo de sus DTOs). */

export type UserStatus = 'active' | 'disabled';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: UserStatus;
  providers: string[];
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

/** Usuario autenticado + permisos efectivos (`recurso:acción`). */
export interface Profile extends User {
  permissions: string[];
}

export interface TokenResponse {
  access_token: string;
  token_type: 'bearer';
  /** Segundos de vida del access token. */
  expires_in: number;
  user: Profile;
}

export interface Role {
  key: string;
  name: string;
  description: string;
  permissions: string[];
  is_system: boolean;
}

export interface PermissionInfo {
  key: string;
  description: string;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';

/** Evento de la bitácora del sistema (`GET /api/v1/logs`). */
export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  service: string;
  module: string;
  event: string;
  message: string;
  environment: string;
  request_id: string | null;
  user_id: string | null;
  session_id: string | null;
  ip: string | null;
  details: Record<string, unknown>;
}

export interface LogFilters {
  module?: string;
  /** Nivel mínimo. */
  level?: LogLevel | '';
  user_id?: string;
  session_id?: string;
  request_id?: string;
  q?: string;
  since?: string;
  page?: number;
  page_size?: number;
}

export interface UserFilters {
  q?: string;
  role?: string;
  status?: UserStatus | '';
  page?: number;
  page_size?: number;
}

/** Permisos conocidos por el frontend (deben coincidir con `Permission` del backend). */
export const PERMISSIONS = {
  USERS_READ: 'users:read',
  USERS_CREATE: 'users:create',
  USERS_UPDATE: 'users:update',
  USERS_DELETE: 'users:delete',
  ROLES_READ: 'roles:read',
  ROLES_MANAGE: 'roles:manage',
  LOGS_READ: 'logs:read',
} as const;

export type PermissionKey = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];
