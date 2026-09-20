/// <reference types="vite/client" />

/** Variables de entorno tipadas (private/.env.*). Solo las que empiezan con VITE_ llegan al cliente. */
interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENV?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_REMOTES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
