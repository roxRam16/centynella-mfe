/** Administración de usuarios (`/api/v1/users`). */
import { apiRequest } from './apiClient';
import type { Page, User, UserFilters, UserStatus } from './types';

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: string;
  status: UserStatus;
}

export interface UpdateUserInput {
  name?: string;
  role?: string;
  status?: UserStatus;
}

export const listUsers = (filters: UserFilters, signal?: AbortSignal): Promise<Page<User>> =>
  apiRequest<Page<User>>('/users', { query: { ...filters }, signal });

export const createUser = (input: CreateUserInput): Promise<User> =>
  apiRequest<User>('/users', { method: 'POST', body: input });

export const updateUser = (id: string, input: UpdateUserInput): Promise<User> =>
  apiRequest<User>(`/users/${encodeURIComponent(id)}`, { method: 'PATCH', body: input });

export const deleteUser = (id: string): Promise<void> =>
  apiRequest<void>(`/users/${encodeURIComponent(id)}`, { method: 'DELETE' });
