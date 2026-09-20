/**
 * Acceso tipado y validado a las variables de entorno (`private/.env.*`).
 * Patrón: objeto de configuración inmutable, validado una sola vez al arrancar
 * (fail-fast: es mejor romper al inicio que en mitad de una pantalla).
 */

export type AppEnvironment = 'sandbox' | 'production';

export interface AppConfig {
  readonly appName: string;
  readonly appEnv: AppEnvironment;
  /** URL base de CENTYNELLA-CORE, sin "/" final. */
  readonly apiBaseUrl: string;
}

const VALID_ENVIRONMENTS: readonly AppEnvironment[] = ['sandbox', 'production'];

/** Subconjunto de `import.meta.env` que este módulo necesita (facilita las pruebas). */
export type RawEnv = Partial<
  Record<'VITE_APP_NAME' | 'VITE_APP_ENV' | 'VITE_API_BASE_URL', string>
>;

/**
 * Construye la configuración a partir de variables crudas.
 * @throws Error si falta una variable obligatoria o tiene un valor no permitido.
 */
export function parseEnv(raw: RawEnv): AppConfig {
  const appEnv = raw.VITE_APP_ENV as AppEnvironment | undefined;
  if (!appEnv || !VALID_ENVIRONMENTS.includes(appEnv)) {
    throw new Error(
      `VITE_APP_ENV inválida: "${raw.VITE_APP_ENV}". Valores permitidos: ${VALID_ENVIRONMENTS.join(', ')}`,
    );
  }
  if (!raw.VITE_API_BASE_URL) {
    throw new Error('Falta la variable VITE_API_BASE_URL en private/.env.<ambiente>');
  }

  return Object.freeze({
    appName: raw.VITE_APP_NAME || 'CENTYNELLA',
    appEnv,
    apiBaseUrl: raw.VITE_API_BASE_URL.replace(/\/+$/, ''),
  });
}

/** Configuración de la aplicación lista para usar. */
export const config: AppConfig = parseEnv(import.meta.env);
