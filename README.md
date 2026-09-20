# CENTYNELLA-MFE

**Shell (host) de microfrontends** de CENTYNELLA, plataforma de administración y gestión de inventarios.
Construido con **React 19 · Vite · TypeScript** y **Module Federation**; contenerizado con Docker y desplegado en AWS.

> El backend vive en otro repositorio: [centynella-core](https://github.com/roxRam16/centynella-core) (FastAPI + MongoDB). **Este repo no contiene código de backend.**

## Arquitectura de microfrontends

```
                    ┌───────────────────────────────┐
                    │  CENTYNELLA-MFE  (este repo)  │
                    │  SHELL / HOST                 │
                    │  layout · rutas · tema · UI   │
                    └──────┬───────────────┬────────┘
       Module Federation   │               │   Module Federation
                 ┌─────────▼──────┐  ┌─────▼──────────┐
                 │ remote:        │  │ remote:        │   ← proyectos standalone
                 │ inventory (…)  │  │ orders (…)     │     (aún por crear)
                 └────────────────┘  └────────────────┘
                              │
                              ▼  REST
                     CENTYNELLA-CORE (API)
```

- Este proyecto es el **host**: aporta el layout, la navegación, el tema y la librería de componentes.
- Cada **remote** (microfrontend standalone) es un proyecto aparte con su propio repo y despliegue; el shell lo carga en tiempo de ejecución.
- `react`, `react-dom`, `react-router-dom`, MUI y Emotion se comparten como **singleton** para que exista una sola copia (ver [federation.config.ts](federation.config.ts)). **Todo remote debe declarar el mismo bloque `shared`.**
- Si un remote falla o está caído, un _Error Boundary_ lo aísla: el shell y los demás módulos siguen funcionando.

## Estructura

```
centynella-mfe/
├── private/                # Variables de entorno (.env.sandbox, .env.production) — NO versionadas
├── public/                 # Estáticos (favicon)
├── src/
│   ├── components/         # Librería propia de UI (Button, Alert, Grid) sobre MUI
│   ├── config/             # Variables de entorno tipadas y validadas
│   ├── federation/         # Registro de remotes, RemoteModule (Suspense + ErrorBoundary)
│   ├── hooks/              # Hooks reutilizables (useAsyncResource, useApiHealth)
│   ├── layouts/            # ShellLayout (header · nav · main · footer semánticos)
│   ├── pages/              # Páginas del shell
│   ├── routes/             # Enrutado (incluye las rutas de los remotes)
│   ├── services/           # Acceso al backend (httpClient + servicios)
│   ├── theme/              # Paleta (teoría del color), tema MUI y ThemeProvider
│   ├── utils/              # Utilidades puras (contraste WCAG)
│   └── test/               # Setup de pruebas
├── .github/workflows/      # deploy.yml
├── federation.config.ts    # Configuración de Module Federation (host)
├── vite.config.ts · tsconfig*.json · eslint.config.js · .prettierrc
├── Dockerfile · nginx.conf · .dockerignore · .gitignore
└── index.html · package.json
```

Alias `@/` → `src/`. Cada componente vive en su carpeta con su `index.ts` y su prueba.

## Puesta en marcha (local)

Requisitos: Node ≥ 20.19.

```bash
npm ci
copy private\.env.example private\.env.sandbox    # y ajusta los valores (Linux/Mac: cp)
npm run dev                                        # http://localhost:5173
```

Para ver el estado del backend en la portada, levanta antes CENTYNELLA-CORE (`docker compose up -d --build` en ese repo).

### Scripts

| Comando                                       | Qué hace                                    |
| --------------------------------------------- | ------------------------------------------- |
| `npm run dev`                                 | Servidor de desarrollo (ambiente `sandbox`) |
| `npm run build:sandbox` / `build:production`  | Build por ambiente                          |
| `npm run preview`                             | Sirve el build local                        |
| `npm run lint` · `format:check` · `typecheck` | Calidad estática                            |
| `npm test` · `test:watch` · `test:coverage`   | Pruebas (cobertura mínima 80 %)             |

## Variables de entorno

Viven en `private/` (Vite: `envDir: 'private'`), una por ambiente: `.env.sandbox` (developer) y `.env.production`. Plantilla en [private/.env.example](private/.env.example). Están en `.gitignore`.

| Variable            | Descripción                                                   |
| ------------------- | ------------------------------------------------------------- |
| `VITE_APP_NAME`     | Nombre visible de la app                                      |
| `VITE_APP_ENV`      | `sandbox` \| `production`                                     |
| `VITE_API_BASE_URL` | URL de CENTYNELLA-CORE (sin `/` final)                        |
| `VITE_REMOTES`      | Remotes de la federación: `nombre@urlRemoteEntry,nombre@url…` |

> ⚠ Todo `VITE_*` queda en el bundle público: **no guardar secretos aquí.**

## Integrar un microfrontend standalone

1. Añade el remote a `VITE_REMOTES` en `private/.env.*`:
   `VITE_REMOTES=inventory@http://localhost:5174/remoteEntry.js`
2. Declara el módulo para TypeScript, p. ej. en `src/federation/remotes.d.ts`: `declare module 'inventory/App';`
3. Regístralo en [src/federation/remoteRegistry.ts](src/federation/remoteRegistry.ts):
   ```ts
   { id: 'inventory', label: 'Inventario', path: '/inventory', loader: () => import('inventory/App') }
   ```
4. El shell genera solo la ruta (`/inventory/*`) y el enlace en la navegación.

El remote debe: exponer `./App` (componente React por `default`), compartir las mismas dependencias singleton y usar `basename` acorde a su ruta.

## Diseño

- **Teoría del color** ([src/theme/palette.ts](src/theme/palette.ts)): esquema complementario azul (primario, confianza) + naranja (acento, ~10 %) sobre neutros fríos (~60 %). Regla 60-30-10.
- **Atributos preatentivos:** color semántico (verde/ámbar/rojo/cian), tamaño y peso para jerarquía, siempre con **icono y texto** además del color (accesible a daltonismo).
- **Accesibilidad:** todos los pares texto/fondo cumplen WCAG AA (≥ 4.5:1), verificado por pruebas automáticas ([palette.test.ts](src/theme/palette.test.ts)). HTML semántico (`header`, `nav`, `main`, `footer`), enlace "saltar al contenido", `aria-current`, `role="alert"`.
- **Responsive (mobile-first):** grilla de 12 columnas por breakpoint, tipografía fluida con `clamp()`, contenedores sin píxeles fijos.
- **Componentes propios** ([src/components](src/components)): la app y los remotes importan de aquí, nunca de MUI directo, para mantener coherencia y poder cambiar de librería en un solo lugar.

## Patrones y buenas prácticas

| Patrón / práctica             | Dónde                                                    |
| ----------------------------- | -------------------------------------------------------- |
| Adapter                       | `Button` (variantes propias → MUI), `httpClient` (fetch) |
| Registry                      | `remoteRegistry` (navegación y rutas se generan de él)   |
| Error Boundary + Suspense     | `RemoteModule` (aislamiento de fallos de remotes)        |
| Custom Hooks                  | `useAsyncResource` (genérico), `useApiHealth`            |
| Fail-fast config              | `parseEnv` (valida el entorno al arrancar)               |
| Barrel exports                | `index.ts` por módulo                                    |
| Composición sobre herencia    | `Grid` + `GridItem`, `ShellLayout` + `Outlet`            |
| Memoización a nivel de módulo | `lazyRemotes` (un `lazy` por remote)                     |

## Pruebas

```bash
npm test                # 63 pruebas (Vitest + Testing Library)
npm run test:coverage   # falla si la cobertura baja de 80 %
```

Cubren componentes, hooks, servicios, configuración, tema (contraste WCAG), federación (carga y aislamiento de errores) y rutas. **Ningún despliegue corre sin pasar la batería completa.**

## Docker

```bash
docker build --build-arg APP_ENV=sandbox -t centynella-mfe:sandbox .
docker run --rm -p 8080:80 centynella-mfe:sandbox        # http://localhost:8080
```

Build multi-stage: Node compila con `private/.env.<APP_ENV>` y **nginx** sirve solo `dist/` (~50 MB). Incluye fallback de SPA, cabeceras de seguridad, caché inmutable para `assets/`, `remoteEntry` sin caché y sonda `/health`.

## CI/CD

[.github/workflows/deploy.yml](.github/workflows/deploy.yml): `test` (lint · format · typecheck · cobertura) → `deploy` (build de la imagen → push a ECR → `ecs update-service`). Hoy se dispara **manualmente** (`workflow_dispatch`) hasta terminar la configuración de AWS.

Requiere en GitHub (por _Environment_ `sandbox` / `production`): secretos `AWS_ROLE_ARN` y `FRONTEND_ENV_FILE` (contenido del `.env` del ambiente, que no está en git) y variables `AWS_REGION`, `ECR_REPOSITORY`, `ECS_CLUSTER`, `ECS_SERVICE`.

## Reglas del proyecto

1. **README actualizado en cada despliegue de cambios.**
2. Clean code, patrones de diseño, buenas prácticas de React, código documentado y reutilización.
3. Diseño siempre responsive y respaldado por teoría del color y accesibilidad.
4. Tests antes de desplegar; cobertura ≥ 80 %.
5. Nada de backend en este repo.

## Historial de cambios

### 0.1.0 — Base del proyecto

- Shell (host) con Module Federation, aún sin remotes; registro y carga aislada de microfrontends listos.
- Librería de componentes propia (`Button`, `Alert`, `Grid`) sobre MUI y tema basado en teoría del color con verificación WCAG.
- Layout semántico y responsive, página _Hola Mundo_ con consulta de salud a CENTYNELLA-CORE.
- Variables de entorno por ambiente en `private/`.
- Dockerfile multi-stage + nginx, batería de 63 pruebas y workflow de despliegue.
