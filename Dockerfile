# syntax=docker/dockerfile:1

# ─────────────────────────────────────────────────────────────
# CENTYNELLA-MFE (shell) · build multi-stage
#   Etapa 1 (build):   compila con Vite usando private/.env.<APP_ENV>
#   Etapa 2 (runtime): sirve solo el estático con nginx (imagen mínima)
#
#   docker build --build-arg APP_ENV=sandbox -t centynella-mfe:sandbox .
#   docker run --rm -p 8080:80 -e API_ORIGIN=http://localhost:8000 centynella-mfe:sandbox
# ─────────────────────────────────────────────────────────────

# ── Etapa 1: build ───────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# Ambiente de compilación: sandbox | production (selecciona private/.env.<APP_ENV>)
ARG APP_ENV=sandbox

# Capa de dependencias primero: se cachea mientras no cambien package*.json
COPY package.json package-lock.json ./
# `npm ci` ejecuta el script `prepare` (activa los hooks de git; sin .git no hace nada)
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN test -f "private/.env.${APP_ENV}" \
    || (echo "Falta private/.env.${APP_ENV}. Cópialo desde private/.env.example" && exit 1)
RUN npm run "build:${APP_ENV}"

# ── Etapa 2: runtime ─────────────────────────────────────────
FROM nginx:1.27-alpine AS runtime

# Plantillas de nginx: el contenedor las procesa al arrancar (envsubst) con las variables de abajo.
COPY nginx/ /etc/nginx/templates/
COPY --from=build /app/dist /usr/share/nginx/html

# Orígenes permitidos por la CSP (cámbialos en `docker run -e` / task definition de ECS):
#   API_ORIGIN      origen de CENTYNELLA-CORE
#   REMOTE_ORIGINS  microfrontends remotos (separados por espacio)
ENV API_ORIGIN=http://localhost:8000
ENV REMOTE_ORIGINS=""

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/health || exit 1

CMD ["nginx", "-g", "daemon off;"]
