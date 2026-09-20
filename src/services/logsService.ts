/** Bitácora del sistema (`/api/v1/logs`, requiere `logs:read`). */
import { apiRequest } from './apiClient';
import type { LogEntry, LogFilters, Page } from './types';

export const searchLogs = (filters: LogFilters, signal?: AbortSignal): Promise<Page<LogEntry>> =>
  apiRequest<Page<LogEntry>>('/logs', { query: { ...filters }, signal });

/** Módulos que han registrado eventos (para el filtro). */
export const listLogModules = (signal?: AbortSignal): Promise<string[]> =>
  apiRequest<string[]>('/logs/modules', { signal });
