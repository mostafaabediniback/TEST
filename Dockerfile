# syn tax=docker/dockerfile:1

FROM node:24-trixie-slim AS build
WORKDIR /app

ARG VITE_API_BASE_URL=/api/v1
# ARG VITE_MAP_TILE_URL="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
ARG VITE_MAP_STYLE_URL=/tiles/styles/basic-preview/style.json
ENV VITE_MAP_STYLE_URL=$VITE_MAP_STYLE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV PNPM_HOME=/pnpm \
    COREPACK_HOME=/corepack \
    PATH=/pnpm:$PATH

RUN corepack enable pnpm \
    && pnpm config set store-dir /pnpm/store

# Copy dependency manifests first to keep the install layer cacheable.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Reuse pnpm's package store and Corepack's pnpm download cache across builds.
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    --mount=type=cache,id=corepack-cache,target=/corepack \
    pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80