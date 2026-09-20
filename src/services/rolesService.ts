/** Roles y permisos (`/api/v1/roles`, `/api/v1/permissions`). */
import { apiRequest } from './apiClient';
import type { PermissionInfo, Role } from './types';

export interface CreateRoleInput {
  key: string;
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleInput {
  name?: string;
  description?: string;
  permissions?: string[];
}

export const listRoles = (signal?: AbortSignal): Promise<Role[]> =>
  apiRequest<Role[]>('/roles', { signal });

export const listPermissions = (signal?: AbortSignal): Promise<PermissionInfo[]> =>
  apiRequest<PermissionInfo[]>('/permissions', { signal });

export const createRole = (input: CreateRoleInput): Promise<Role> =>
  apiRequest<Role>('/roles', { method: 'POST', body: input });

export const updateRole = (key: string, input: UpdateRoleInput): Promise<Role> =>
  apiRequest<Role>(`/roles/${encodeURIComponent(key)}`, { method: 'PATCH', body: input });

export const deleteRole = (key: string): Promise<void> =>
  apiRequest<void>(`/roles/${encodeURIComponent(key)}`, { method: 'DELETE' });
