# CENTYNELLA-MFE (frontend · shell/host)

Shell de Module Federation de la plataforma de inventarios CENTYNELLA (React 19 + Vite + TypeScript). Los microfrontends standalone futuros son **remotes** que se integran aquí. Su backend es otro repo (`C:\github\centynella-core`). **Nunca mezclar código de backend aquí.**

## Comandos

```bash
npm run dev              # http://localhost:5173 (modo sandbox)
npm test                 # Vitest (usa test:coverage para el umbral del 80 %)
npm run lint && npm run format:check && npm run typecheck
npm run build:sandbox    # o build:production
```

## Estructura obligatoria

Raíz: `private/` (los `.env.sandbox` / `.env.production`, NO en la raíz), `public/`, `src/`, `.github/workflows/deploy.yml`, `.gitignore`, `.dockerignore`, `Dockerfile`, `index.html`, `vite.config.ts`, `tsconfig*.json`, `package.json`, `README.md`.
`src/`: `components` (librería propia de UI sobre MUI), `config`, `context` (sesión), `federation`, `hooks`, `layouts`, `pages`, `routes`, `services`, `theme`, `utils`, `test`. Alias `@/` → `src/`. `scripts/` + `.githooks/` = versionado automático; `nginx/` = plantillas de nginx (CSP). `mockups/` = diseños de referencia (ignorada por git y Docker; no borrar).

## Reglas

- **Componentes:** importar SIEMPRE de `@/components` (nuestra librería), nunca de MUI directo en pantallas. Reutilizar antes de crear. Todo componente reutilizable nuevo: carpeta `src/components/<Nombre>/` con `.tsx` + `index.ts` + `.test.tsx`, exportado en `components/index.ts`; lo específico de una sola pantalla se queda en `pages/`.
- **React:** componentes pequeños y tipados, lógica en hooks personalizados, sin efectos innecesarios, `Suspense` + `ErrorBoundary` para lo asíncrono/remoto.
- **Patrones de diseño** y clean code; JSDoc/comentarios de intención en lo no obvio.
- **Diseño:** la fuente de verdad son los mockups (`mockups/`): paleta azul/iris, tipografía **Poppins**, tokens de `theme/tokens.ts`. Siempre responsive (mobile-first, breakpoints, sin px fijos), teoría del color (usar solo tokens de `theme/palette.ts`, pares con contraste WCAG AA ≥ 4.5:1), atributos preatentivos con icono + texto (no solo color), HTML semántico y accesible.
- **Sesión:** el access token vive SOLO en memoria (`tokenStore`), nunca en localStorage. Las llamadas a la API pasan por `apiRequest` (renueva la sesión ante 401). Rutas con `RequireAuth`/`RequirePermission`; la seguridad real la valida el backend.
- **Versión:** sale de `package.json` (`APP_VERSION`); el hook `pre-commit` la sube una vez por push (no editar `package-lock.json` a mano). Login: `Sistema de inventario IA 2025 - V.x.y.z`.
- **Seguridad de entradas:** validar con `utils/validation.ts` (correo con `@`, contraseña mayúscula/minúscula/número/símbolo, nombres/textos sin `< >`), `maxLength` en los inputs, NUNCA `dangerouslySetInnerHTML`. Toda pantalla de error usa `StatusPage`; URLs desconocidas → 404 amable. La CSP vive en `nginx/`.
- **Formularios:** `react-hook-form` + `zod` (`utils/validation.ts`, mismas reglas que el backend); errores del backend traducidos con `getErrorMessage`.
- **Federation:** los remotes se declaran en `VITE_REMOTES` y en `src/federation/remoteRegistry.ts`; el bloque `shared` de `federation.config.ts` debe ser idéntico en host y remotes.
- **Env:** solo en `private/` (ignorado por git). `VITE_*` es público: nunca secretos.
- **Tests antes de desplegar**, cobertura ≥ 80 %. Cada componente/hook/servicio con su `*.test.ts(x)`.
- **Actualizar el README en cada despliegue de cambios** (incluida la sección "Historial de cambios").
- Todo remote nuevo debe seguir esta misma estructura.
