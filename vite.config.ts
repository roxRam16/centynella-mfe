/// <reference types="vitest/config" />
import { fileURLToPath } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { federation } from '@module-federation/vite';
import { FEDERATION_NAME, SHARED_DEPENDENCIES, parseRemotes } from './federation.config';

/** Carpeta con los .env (fuera de la raíz, por convención del proyecto). */
const ENV_DIR = 'private';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, ENV_DIR, 'VITE_');
  const isTest = Boolean(process.env.VITEST);

  return {
    envDir: ENV_DIR,
    plugins: [
      react(),
      // El plugin de federación no aporta nada en tests unitarios (jsdom).
      !isTest &&
        federation({
          name: FEDERATION_NAME,
          remotes: parseRemotes(env.VITE_REMOTES),
          shared: { ...SHARED_DEPENDENCIES },
          dts: false,
        }),
    ],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: { port: 5173, strictPort: true },
    preview: { port: 5173, strictPort: true },
    // Module Federation usa top-level await: requiere un target moderno.
    // El chunk de MUI (dependencia compartida singleton) supera 500 kB; es esperado.
    build: { target: 'esnext', chunkSizeWarningLimit: 600 },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', '*.test.ts'],
      env: {
        VITE_APP_NAME: 'CENTYNELLA',
        VITE_APP_ENV: 'sandbox',
        VITE_API_BASE_URL: 'http://api.test',
        VITE_REMOTES: '',
      },
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}', 'federation.config.ts'],
        exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}', 'src/vite-env.d.ts'],
        // Piso de calidad: el CI falla si la cobertura baja de aquí.
        thresholds: { statements: 80, branches: 80, functions: 80, lines: 80 },
      },
    },
  };
});
