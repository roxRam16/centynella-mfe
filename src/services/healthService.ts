import { config } from '@/config/env';
import { httpGet } from './httpClient';

/** Respuesta de `GET /health` de CENTYNELLA-CORE. */
export interface HealthStatus {
  status: 'ok';
  service: string;
  version: string;
  timestamp: string;
}

/**
 * Consulta el endpoint de salud (liveness) del backend.
 * Función a nivel de módulo → referencia estable, segura para `useAsyncResource`.
 */
export function getHealth(signal?: AbortSignal): Promise<HealthStatus> {
  return httpGet<HealthStatus>(`${config.apiBaseUrl}/health`, signal);
}
