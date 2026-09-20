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
├── mockups/                # Diseños y guías de estilo de referencia — NO versionada ni en Docker
├── src/
│   ├── components/         # Librería propia de UI reutilizable (ver catálogo abajo)
│   ├── config/             # Variables de entorno tipadas y validadas
│   ├── context/            # AuthProvider: sesión del usuario (única fuente de verdad)
│   ├── federation/         # Registro de remotes, RemoteModule (Suspense + ErrorBoundary)
│   ├── hooks/              # useAuth, useAsyncResource, useDebouncedValue, useApiHealth
│   ├── layouts/            # ShellLayout (app) y AuthLayout (login/registro)
│   ├── pages/              # Pantallas: inicio, perfil, auth/, admin/
│   ├── routes/             # Enrutado y guardias (RequireAuth, PublicOnly, RequirePermission)
│   ├── services/           # apiClient, httpClient, tokenStore y servicios de auth/usuarios/roles
│   ├── theme/              # Paleta, tokens (espaciado, radios, elevación) y tema MUI
│   ├── utils/              # Validación (zod), errores, formato, color, texto
│   └── test/               # Ayudantes de prueba (mockApi, factories, renderWithProviders)
├── .github/workflows/      # deploy.yml
├── federation.config.ts    # Configuración de Module Federation (host)
├── vite.config.ts · tsconfig*.json · eslint.config.js · .prettierrc
├── Dockerfile · nginx.conf · .dockerignore · .gitignore
└── index.html · package.json
```

Alias `@/` → `src/`. Cada componente vive en su carpeta con su `index.ts` y su prueba.

## Puesta en marcha (local)

Requisitos: Node ≥ 20.19 y CENTYNELLA-CORE corriendo (el login y los datos salen de su API). El origen del shell (`http://localhost:5173`) debe estar en `CORS_ORIGINS` del backend.

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

## Sistema de diseño

Fuentes (carpeta `mockups/`, solo referencia): `login.png` (pantalla de acceso), `styles.jpg` (paleta), `style_fonts.png` (tipografía) y `style_guide.jpg` (componentes, estados, espaciado). Todo el proyecto los toma **solo de `src/theme/`** — nunca colores ni medidas sueltas.

- **Paleta** ([palette.ts](src/theme/palette.ts)): esquema monocromático azul + iris — Blue `#2D28F3` (primario), Iris `#6E6DF8`, Violet `#7D58E0` (acento), Light pink `#D1CFF7`, Light blue `#EEF3F9` (fondo), Dark gray `#2B3037` (texto). Regla 60-30-10.
- **Tipografía:** **Poppins** (400 · 500 · 600 · 700) autoalojada con `@fontsource` (sin CDN). Escala: H1 32 · H2 24 · Subtítulo 18 · Cuerpo 16/14 · Caption 12 · Botón 14 semibold.
- **Tokens** ([tokens.ts](src/theme/tokens.ts)): espaciado 4·8·16·24·32·48, radios (0·4·8·16·píldora) y elevación 0-3 con sombra teñida de azul.
- **Estados** (guía): botones Normal → Hover (más claro) → Pressed (más oscuro); campo con foco violet + halo iris; error rojo; alertas con fondo tenue + borde + icono.
- **Atributos preatentivos:** color semántico (verde/ámbar/rojo/azul), tamaño y peso para jerarquía; el estado **nunca** va solo en color (siempre icono + texto).
- **Accesibilidad:** pares texto/fondo WCAG AA (≥ 4.5:1) verificados por [palette.test.ts](src/theme/palette.test.ts) — incluye los hallazgos conocidos (iris solo decoración/texto grande; violet como texto solo sobre blanco). HTML semántico, etiquetas asociadas, `role="alert"`, foco visible, navegación por teclado.
- **Responsive (mobile-first):** grilla de 12 columnas por breakpoint, tipografía fluida con `clamp()`, el login se apila en móvil y las tablas hacen scroll horizontal en su contenedor.
- **Ilustración y fondo del login:** SVG propios inspirados en el mockup ([AuthArtwork.tsx](src/layouts/AuthArtwork.tsx)). Si se dispone del arte original, se reemplaza solo ese archivo.

### Catálogo de componentes (`src/components`)

Importa **siempre** de `@/components`, nunca de MUI en las pantallas. Cada componente: carpeta propia + `index.ts` + prueba. Antes de crear uno nuevo, revisa si ya existe.

| Grupo              | Componentes                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Acciones           | `Button` (primary · secondary · outlined · text; `shape`, `danger`, `loading`), `GoogleButton`, `Link` |
| Formularios        | `TextField`, `PasswordField`, `Select`, `Checkbox` (compatibles con `react-hook-form`)                 |
| Feedback           | `Alert`, `Spinner`, `Chip`, `Dialog`, `ConfirmDialog`, `DropdownMenu`                                  |
| Estructura y datos | `Card`, `Grid`/`GridItem`, `Tabs`, `DataTable`, `Pagination`, `PageHeader`                             |
| Identidad          | `Logo`, `Avatar`                                                                                       |

## Autenticación y sesión

El shell es el **dueño de la sesión** (los remotes la consumen con `useAuth()`); el login vive aquí, no en un microfrontend, porque está en el camino crítico de todos los demás.

- **Persistencia:** el access token (15 min) vive **solo en memoria** ([tokenStore.ts](src/services/tokenStore.ts)); el refresh token va en una cookie **HttpOnly** que JavaScript no puede leer. Al abrir o **recargar** la app, `AuthProvider` pide un access token con esa cookie y restaura la sesión — sin `localStorage`, así un XSS no puede robarla.
- **Renovación transparente:** el token se renueva antes de vencer y, ante un 401, `apiClient` renueva y **reintenta la petición una vez** (single-flight: varias peticiones comparten una sola renovación).
- **Cierre entre pestañas:** cerrar sesión en una pestaña la cierra en todas (`BroadcastChannel`).
- **Rutas:** `RequireAuth` (sesión), `PublicOnly` (solo visitantes) y `RequirePermission` (403 conservando la URL). Ocultar un enlace no es seguridad: el backend valida el permiso en cada petición.
- **Formularios:** `react-hook-form` + `zod`, con las mismas reglas que el backend; los errores del backend se traducen por su `code` a mensajes en español ([errors.ts](src/utils/errors.ts)).
- **Google:** el botón está en el diseño, deshabilitado ("Próximamente"); el contrato del backend ya existe.

| Ruta                                        | Acceso               | Pantalla                                                    |
| ------------------------------------------- | -------------------- | ----------------------------------------------------------- |
| `/login` · `/register` · `/forgot-password` | solo visitantes      | Iniciar sesión · Crear cuenta · Recuperar contraseña        |
| `/reset-password?token=…`                   | pública              | Nueva contraseña (enlace del correo)                        |
| `/` · `/profile`                            | sesión               | Inicio · Mi perfil (datos y cambio de contraseña)           |
| `/admin/users`                              | permiso `users:read` | Usuarios: buscar, filtrar, paginar, crear, editar, eliminar |
| `/admin/roles`                              | permiso `roles:read` | Roles y permisos (editar con `roles:manage`)                |

Uso desde un remote: `const { user, hasPermission } = useAuth();` y `apiRequest('/ruta')` (adjunta el token y renueva la sesión solo).

## Patrones y buenas prácticas

| Patrón / práctica             | Dónde                                                          |
| ----------------------------- | -------------------------------------------------------------- |
| Adapter                       | `Button` (variantes propias → MUI), `httpClient` (fetch)       |
| Registry                      | `remoteRegistry` (navegación y rutas se generan de él)         |
| Error Boundary + Suspense     | `RemoteModule` (aislamiento de fallos de remotes)              |
| Custom Hooks                  | `useAsyncResource` (genérico), `useApiHealth`                  |
| Fail-fast config              | `parseEnv` (valida el entorno al arrancar)                     |
| Barrel exports                | `index.ts` por módulo                                          |
| Composición sobre herencia    | `Grid` + `GridItem`, `ShellLayout` + `Outlet`                  |
| Memoización a nivel de módulo | `lazyRemotes` (un `lazy` por remote)                           |
| Inversión de dependencias     | `registerSessionRefresher` (el cliente HTTP no conoce a React) |
| Context + Provider            | `AuthProvider` / `useAuth`                                     |
| Guard (rutas)                 | `RequireAuth`, `PublicOnly`, `RequirePermission`               |
| Single-flight                 | `refreshSession` (una renovación compartida)                   |

## Pruebas

```bash
npm test                # 259 pruebas (Vitest + Testing Library)
npm run test:coverage   # falla si la cobertura baja de 80 %
```

Cubren componentes, hooks, servicios (cliente HTTP, renovación de sesión), contexto de sesión, guardias, todas las pantallas (login, registro, recuperación, perfil, usuarios, roles), tema (contraste WCAG), federación y rutas. Las pantallas se prueban contra un `fetch` simulado por ruta (`src/test/mockApi.ts`), así también se verifica el contrato con el backend. **Ningún despliegue corre sin pasar la batería completa.**

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

### 0.2.0 — Autenticación y sistema de diseño de marca

- Sistema de diseño tomado de los mockups: paleta azul/iris, tipografía Poppins, tokens de espaciado/radio/elevación y estados de la guía.
- 17 componentes reutilizables nuevos (`TextField`, `PasswordField`, `Select`, `Checkbox`, `Card`, `Chip`, `Tabs`, `Link`, `Avatar`, `Dialog`, `DropdownMenu`, `DataTable`, `Pagination`, `Spinner`, `Logo`, `PageHeader`, `GoogleButton`) y `Button`/`Alert` restilizados.
- Login fiel al mockup, registro, recuperación y restablecimiento de contraseña; Google preparado (deshabilitado).
- Sesión persistente (cookie HttpOnly + token en memoria), renovación automática, cierre sincronizado entre pestañas.
- Rutas protegidas por sesión y por permiso; perfil de usuario; administración de usuarios y de roles/permisos.
- `mockups/` ignorada en git y Docker. 259 pruebas, cobertura ~96 %.

### 0.1.0 — Base del proyecto

- Shell (host) con Module Federation, aún sin remotes; registro y carga aislada de microfrontends listos.
- Librería de componentes propia (`Button`, `Alert`, `Grid`) sobre MUI y tema basado en teoría del color con verificación WCAG.
- Layout semántico y responsive, página _Hola Mundo_ con consulta de salud a CENTYNELLA-CORE.
- Variables de entorno por ambiente en `private/`.
- Dockerfile multi-stage + nginx, batería de 63 pruebas y workflow de despliegue.
