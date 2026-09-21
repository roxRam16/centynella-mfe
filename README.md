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
│   ├── layouts/            # ShellLayout + Sidebar + navigation (app) y AuthLayout (login/registro)
│   ├── pages/              # Pantallas: inicio, perfil, errores (StatusPage), auth/, admin/
│   ├── routes/             # Enrutado y guardias (RequireAuth, PublicOnly, RequirePermission)
│   ├── services/           # apiClient, httpClient, tokenStore y servicios de auth/usuarios/roles
│   ├── theme/              # Paleta, tokens (espaciado, radios, elevación) y tema MUI
│   ├── utils/              # Validación (zod), errores, formato, color, texto
│   └── test/               # Ayudantes de prueba (mockApi, factories, renderWithProviders)
├── .github/workflows/      # deploy.yml
├── .githooks/              # pre-commit: versionado automático
├── scripts/                # bump-version.mjs (versión) · setup-hooks.mjs
├── nginx/                  # Plantillas de nginx (cabeceras de seguridad + CSP)
├── federation.config.ts    # Configuración de Module Federation (host)
├── vite.config.ts · tsconfig*.json · eslint.config.js · .prettierrc
├── Dockerfile · .dockerignore · .gitignore
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

## Cómo se ve un microfrontend (layout del shell)

Prototipo: `mockups/mockup.png`. El shell ([ShellLayout.tsx](src/layouts/ShellLayout.tsx)) dibuja **todo el marco**; un remote solo aporta su contenido.

- **Encabezado:** degradado de marca Blue → Violet (`palette.header.gradient`), con logo y menú de usuario. Texto blanco con contraste AA sobre ambos extremos.
- **Menú lateral** ([Sidebar.tsx](src/layouts/Sidebar.tsx)): negro suave `#1F2430` (nunca `#000`) con **dos estados**: _riel_ angosto solo con iconos (siempre visible, con tooltip y `aria-label`) y _extendido_ (usuario, textos, grupos desplegables, perfil, cerrar sesión, ambiente SANDBOX y versión). Al extenderse **empuja el contenido** (no lo tapa); solo en pantallas muy pequeñas (xs) se superpone con un velo y se repliega al elegir una opción. Se alterna con el botón de hamburguesa/X del propio menú; Esc lo colapsa; tocar un grupo en el riel lo extiende con el grupo abierto. Ítem activo en violet con `aria-current="page"`.
- **Navegación** ([navigation.tsx](src/layouts/navigation.tsx)): `buildNavigation(remotes, hasPermission)` arma "Inicio", un enlace por remote registrado y el grupo "Administración" filtrado por permisos. Ocultar un enlace no es seguridad: el backend valida cada petición.
- **Un remote:** se renderiza dentro de `<main>` (con `Suspense` + `ErrorBoundary`), **no dibuja su propio encabezado ni menú**, usa componentes de la librería y solo los tokens del tema. Al registrarlo en `remoteRegistry` aparece solo en el menú.

## Notificaciones (toasts)

Avisos breves y no bloqueantes para confirmar acciones ("Usuario creado correctamente"). Piezas: `Toast` y `ToastViewport` en [components/Toast](src/components/Toast), el proveedor [ToastProvider](src/context/ToastProvider.tsx) (montado una vez en [App.tsx](src/App.tsx), por encima del enrutador) y el hook [useToast](src/hooks/useToast.ts).

```tsx
const toast = useToast();
toast.success('Usuario "Ana" creado correctamente');
toast.error(getErrorMessage(error), { title: 'No se pudo eliminar el usuario' });
// también: toast.info(...), toast.warning(...), toast.clear()  ·  opciones: { title, duration }
```

- **Cuándo usarlo:** confirmar acciones (crear, editar, eliminar, guardar, cambiar contraseña) y errores de acciones puntuales. Los errores de un formulario van en línea dentro del formulario y los de carga de una pantalla en un `Alert` con "Reintentar".
- **Comportamiento:** abajo a la derecha (abajo y a todo lo ancho en móvil), por encima de los modales; máx. 4 a la vez; un aviso repetido reemplaza al anterior; se cierra solo (éxito/info 5 s, aviso 7 s, error 8 s) o con la X, y se **pausa** con el cursor o el foco encima.
- **Accesibilidad:** icono + color + texto (nunca solo color); dos regiones vivas permanentes (`polite` para éxito/info/aviso, `assertive` para errores); respeta `prefers-reduced-motion`.
- **Remotes:** usan el mismo `useToast` (el contexto lo aporta el shell).
- En pruebas, `renderWithProviders` ya incluye el proveedor; usa `notifications()` de [test/toasts.ts](src/test/toasts.ts) para aserciones.

## Sistema de diseño

Fuentes (carpeta `mockups/`, solo referencia): `login.png` (pantalla de acceso), `styles.jpg` (paleta), `style_fonts.png` (tipografía) y `style_guide.jpg` (componentes, estados, espaciado). Todo el proyecto los toma **solo de `src/theme/`** — nunca colores ni medidas sueltas.

- **Paleta** ([palette.ts](src/theme/palette.ts)): esquema monocromático azul + iris — Blue `#2D28F3` (primario), Iris `#6E6DF8`, Violet `#7D58E0` (acento), Light pink `#D1CFF7`, Light blue `#EEF3F9` (fondo), Dark gray `#2B3037` (texto). Regla 60-30-10.
- **Tipografía:** **Poppins** (400 · 500 · 600 · 700) autoalojada con `@fontsource` (sin CDN). Escala: H1 32 · H2 24 · Subtítulo 18 · Cuerpo 16/14 · Caption 12 · Botón 14 semibold.
- **Tokens** ([tokens.ts](src/theme/tokens.ts)): espaciado 4·8·16·24·32·48, radios (0·4·8·16·píldora) y elevación 0-3 con sombra teñida de azul.
- **Estados** (guía): botones Normal → Hover (más claro) → Pressed (más oscuro); campo con foco violet + halo iris; error rojo; alertas con fondo tenue + borde + icono.
- **Atributos preatentivos:** color semántico (verde/ámbar/rojo/azul), tamaño y peso para jerarquía; el estado **nunca** va solo en color (siempre icono + texto).
- **Barras de desplazamiento:** globales en [theme.ts](src/theme/theme.ts) (delgadas, pulgar iris, pista transparente). Si algo debe ocultarse visualmente para lectores de pantalla, usa `visuallyHidden` de `@/utils/a11y`; en `sx` de MUI **nunca** pongas `width: 1` (= 100 %), usa `'1px'`.
- **Accesibilidad:** pares texto/fondo WCAG AA (≥ 4.5:1) verificados por [palette.test.ts](src/theme/palette.test.ts) — incluye los hallazgos conocidos (iris solo decoración/texto grande; violet como texto solo sobre blanco). HTML semántico, etiquetas asociadas, `role="alert"`, foco visible, navegación por teclado.
- **Responsive (mobile-first):** grilla de 12 columnas por breakpoint, tipografía fluida con `clamp()`, el login se apila en móvil y las tablas hacen scroll horizontal en su contenedor.
- **Ilustración y fondo del login:** SVG propios inspirados en el mockup ([AuthArtwork.tsx](src/layouts/AuthArtwork.tsx)). Si se dispone del arte original, se reemplaza solo ese archivo.

### Catálogo de componentes (`src/components`)

Importa **siempre** de `@/components`, nunca de MUI en las pantallas. Cada componente: carpeta propia + `index.ts` + prueba. Antes de crear uno nuevo, revisa si ya existe.

| Grupo              | Componentes                                                                                            |
| ------------------ | ------------------------------------------------------------------------------------------------------ |
| Acciones           | `Button` (primary · secondary · outlined · text; `shape`, `danger`, `loading`), `GoogleButton`, `Link` |
| Formularios        | `TextField`, `PasswordField`, `Select`, `Checkbox` (compatibles con `react-hook-form`)                 |
| Feedback           | `Alert`, `Spinner`, `Chip`, `Dialog`, `ConfirmDialog`, `DropdownMenu`, `Toast`                         |
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

## Versión de la aplicación

El login muestra **"Sistema de inventario IA"** bajo el saludo y, como pie de página, **"Desarrollado por RRR - 2026 - V.0.0.1"** (el pie de la app muestra ambiente y versión). La versión sale del campo `version` de `package.json`, que Vite inyecta al compilar ([version.ts](src/config/version.ts)): una sola fuente de verdad.

**Se incrementa sola una vez por cada push.** Un hook de git (`.githooks/pre-commit`) ejecuta [scripts/bump-version.mjs](scripts/bump-version.mjs): el primer commit posterior a un push sube el parche (`0.0.1 → 0.0.2`); los siguientes commits, hasta el próximo push, ya la encuentran distinta de la del remoto y no la tocan. Usa `npm version`, que actualiza **a la vez `package.json` y `package-lock.json`** (el lock guarda la versión en dos lugares y npm los mantiene sincronizados; no hay que editarlo a mano).

- El hook se activa solo con `npm install` (script `prepare` → `git config core.hooksPath .githooks`).
- Omitir en un commit concreto: `SKIP_VERSION_BUMP=1 git commit …`.
- Para cambios mayores (minor/major) edita `package.json` a mano: el hook respeta una versión ya distinta de la del remoto.

## Seguridad

**Validación de entradas** ([validation.ts](src/utils/validation.ts), espejo del backend, que sigue siendo la autoridad):

| Campo                 | Reglas                                                                                                                                                                |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Correo                | Debe llevar `@`; patrón estricto (sin espacios, comillas, `< >`); máx. 254                                                                                            |
| Contraseña nueva      | 8+ caracteres, **mayúscula, minúscula, número y símbolo**, sin espacios ni caracteres de control; máx. 128. Un checklist en vivo marca cada requisito (icono + texto) |
| Nombre                | Solo letras (cualquier idioma), espacios, apóstrofes, puntos y guiones                                                                                                |
| Textos libres (roles) | Sin `<` `>` ni caracteres de control                                                                                                                                  |

**Contra inyección de HTML/scripts (XSS):** los inputs rechazan marcado; además **React escapa todo lo que pinta** (jamás se usa `dangerouslySetInnerHTML`), así un `<script>` que llegara de la base de datos se vería como texto. Las contraseñas sí pueden llevar `<` `>` porque se guardan solo como hash y nunca se muestran. **Contra inyección NoSQL:** el backend usa tipos estrictos (un `{"$ne": ""}` en un correo se rechaza) y el buscador trata el texto como literal.

**Cabeceras y CSP** (nginx, [nginx/](nginx/)): `Content-Security-Policy` (solo se ejecuta código del propio origen y de los remotes declarados; un script inyectado no correría), `X-Frame-Options: DENY`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` y HSTS, en **todas** las rutas. El contenedor lee dos variables para armar la CSP:

| Variable         | Descripción                                                                  |
| ---------------- | ---------------------------------------------------------------------------- |
| `API_ORIGIN`     | Origen de CENTYNELLA-CORE (ej. `https://api.centynella.com`) — `connect-src` |
| `REMOTE_ORIGINS` | Orígenes de los microfrontends remotos, separados por espacio (opcional)     |

```bash
docker run --rm -p 8080:80 -e API_ORIGIN=https://api.centynella.com centynella-mfe:sandbox
```

## Pantallas de error

Nadie ve una página en blanco ni un error técnico ([StatusPage](src/pages/StatusPage.tsx), mensajes en [statusCatalog.ts](src/pages/statusCatalog.ts)):

- **Dirección inexistente** (con o sin sesión) → **404** a pantalla completa con el fondo de marca y salida a inicio.
- **Sin permiso** → **403** dentro del shell (se conserva el menú).
- **Error inesperado de la app** → **500** (`AppErrorBoundary`), con "Reintentar"; se descarta al navegar a otra página.
- **`/error/:code`** muestra cualquier código HTTP 400-599 (401 → "Iniciar sesión", 402, 408, 429, 502, 503 mantenimiento, 504…); los no catalogados usan un mensaje genérico 4xx/5xx.
- **Errores del propio nginx** (500/502/503/504) → página estática [50x.html](public/50x.html), que funciona aunque la app no cargue.

## Bitácora

Pantalla **/admin/logs** (permiso `logs:read`): todo lo que ocurre en el sistema, en la base de datos de logs del backend. Filtros por **módulo, nivel mínimo, periodo, usuario, sesión, petición** y texto; un clic en un usuario, sesión o petición filtra por él para seguir el hilo, y "Ver" muestra el detalle completo (como texto, escapado). Ver el README de CENTYNELLA-CORE para qué se registra.

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
npm test                # 360 pruebas (Vitest + Testing Library)
npm run test:coverage   # falla si la cobertura baja de 80 %
```

Cubren componentes, hooks, servicios (cliente HTTP, renovación de sesión), contexto de sesión, guardias, todas las pantallas (login, registro, recuperación, perfil, usuarios, roles), tema (contraste WCAG), federación y rutas. Las pantallas se prueban contra un `fetch` simulado por ruta (`src/test/mockApi.ts`), así también se verifica el contrato con el backend. **Ningún despliegue corre sin pasar la batería completa.**

## Docker

```bash
docker build --build-arg APP_ENV=sandbox -t centynella-mfe:sandbox .
docker run --rm -p 8080:80 centynella-mfe:sandbox        # http://localhost:8080
```

Build multi-stage: Node compila con `private/.env.<APP_ENV>` y **nginx** sirve solo `dist/` (~50 MB). Incluye fallback de SPA, cabeceras de seguridad y CSP (ver _Seguridad_), caché inmutable para `assets/`, `remoteEntry` sin caché, sonda `/health` y página estática para errores 5xx. Ojo: `VITE_API_BASE_URL` se **hornea al compilar** (ambiente = `APP_ENV`), mientras que `API_ORIGIN` (CSP) se define al **arrancar** el contenedor: deben apuntar al mismo backend.

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

### 21-sep-2026 — Notificaciones (toasts)

- Componente `Toast` + `ToastProvider` + hook `useToast`: avisos con icono y color, cierre automático con pausa al pasar el cursor, apilado máximo y regiones vivas accesibles.
- Conectado a: crear/editar/eliminar usuarios y roles, guardar datos del perfil, cambiar contraseña, registro y restablecimiento de contraseña (el aviso sobrevive al pasar al login).
- Los errores de acciones (p. ej. eliminar el último administrador) ahora salen como toast; los de formularios siguen en línea.
- 407 pruebas, cobertura ~96 %.

### 21-sep-2026 — Adiós a las barras fantasma y barras de desplazamiento elegantes

- Causa: en `sx` de MUI `width: 1` significa 100 %, así que el texto "solo para lectores de pantalla" (tabla, requisitos de contraseña, spinner) ocupaba todo su contenedor y provocaba barras horizontales/verticales en páginas y modales. Ahora hay un único helper `visuallyHidden` ([a11y.ts](src/utils/a11y.ts)) con 1 px reales.
- Barras de desplazamiento delgadas, redondeadas y en iris (`palette.scrollbar`), con variante clara para el menú oscuro; el contraste del pulgar está probado.
- Los modales ya no muestran el anillo de foco en el contenedor.
- 386 pruebas, cobertura ~96 %.

### 21-sep-2026 — Menú lateral de riel que empuja el contenido y pie del login

- Menú lateral con dos estados: riel de iconos siempre visible y extendido que empuja el contenido (en xs se superpone). Botón de menú dentro del propio menú.
- Login: bajo el saludo solo "Sistema de inventario IA"; la versión pasa a un pie de página "Desarrollado por RRR - 2026 - V.x.y.z" en todas las pantallas de acceso.
- 383 pruebas, cobertura ~96 %.

### 21-sep-2026 — Shell según el mockup: encabezado degradado y menú lateral (V.0.0.2)

- Encabezado con degradado Blue → Violet en lugar de azul sólido.
- Menú lateral negro suave (primera versión: cajón oculto); navegación generada desde `remoteRegistry` y permisos, con grupo "Administración" desplegable.
- Tokens nuevos `header` y `sidebar` en `palette.ts` con pruebas de contraste AA.
- 381 pruebas, cobertura ~96 %.

### 20-sep-2026 — Bitácora, seguridad de entradas, pantallas de error y versionado (V.0.0.1)

- Login: "Sistema de inventario IA 2025 - V.x.y.z" tomado de `package.json`; versión que sube sola una vez por push (hook de git; `package-lock.json` se actualiza a la vez con `npm version`).
- Validación endurecida: correo estricto con `@`, contraseña con mayúscula/minúscula/número/símbolo (checklist en vivo), nombres y textos sin HTML; límites de longitud en los inputs.
- Pantallas amables para 404 (URLs inexistentes), 403, 500 y cualquier código HTTP (`/error/:code`), más red de seguridad global de errores y página estática para errores de nginx.
- Pantalla `/admin/logs` (bitácora) con filtros por módulo, nivel, periodo, usuario, sesión y petición.
- nginx con CSP y cabeceras de seguridad en todas las rutas (plantillas con `API_ORIGIN` / `REMOTE_ORIGINS`).
- 360 pruebas, cobertura ~96 %.

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
