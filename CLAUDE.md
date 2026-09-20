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
`src/`: `components` (librería propia de UI sobre MUI), `config`, `federation`, `hooks`, `layouts`, `pages`, `routes`, `services`, `theme`, `utils`, `test`. Alias `@/` → `src/`.

## Reglas

- **Componentes:** importar SIEMPRE de `@/components` (nuestra librería), nunca de MUI directo en pantallas. Reutilizar antes de crear.
- **React:** componentes pequeños y tipados, lógica en hooks personalizados, sin efectos innecesarios, `Suspense` + `ErrorBoundary` para lo asíncrono/remoto.
- **Patrones de diseño** y clean code; JSDoc/comentarios de intención en lo no obvio.
- **Diseño:** siempre responsive (mobile-first, breakpoints, sin px fijos), teoría del color (usar solo tokens de `theme/palette.ts`, pares con contraste WCAG AA ≥ 4.5:1), atributos preatentivos con icono + texto (no solo color), HTML semántico y accesible.
- **Federation:** los remotes se declaran en `VITE_REMOTES` y en `src/federation/remoteRegistry.ts`; el bloque `shared` de `federation.config.ts` debe ser idéntico en host y remotes.
- **Env:** solo en `private/` (ignorado por git). `VITE_*` es público: nunca secretos.
- **Tests antes de desplegar**, cobertura ≥ 80 %. Cada componente/hook/servicio con su `*.test.ts(x)`.
- **Actualizar el README en cada despliegue de cambios** (incluida la sección "Historial de cambios").
- Todo remote nuevo debe seguir esta misma estructura.
