# Dockerfile for Video Renderer Service
# Multi-stage build for production deployment

#
# Development Stage
#
FROM --platform=linux/amd64 node:20-alpine as dev

# Install FFmpeg for video processing
RUN apk add --no-cache ffmpeg

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npx npm i -g pnpm --ignore-scripts

WORKDIR /app

ENV NODE_ENV dev

COPY ./pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch

COPY ./package.json ./pnpm-workspace.yaml ./pnpm-lock.yaml ./tsconfig.base.json ./
COPY ./packages/globals ./packages/globals

# Copy source code
COPY --chown=node:node ./packages/video-renderer ./packages/video-renderer
COPY --chown=node:node ./packages/common ./packages/common

# Install dependencies
RUN pnpm i --frozen-lockfile --ignore-scripts

USER node

#
# Build Stage
#
FROM --platform=linux/amd64 node:20-alpine as build

# Install FFmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app

ENV PNPM_HOME="/root/.local/share/pnpm"
ENV PATH="${PATH}:${PNPM_HOME}"
RUN npx npm i -g pnpm

ENV NODE_ENV production

# Copy dependencies and source from dev stage
COPY --chown=node:node --from=dev /app/node_modules ./node_modules
COPY --chown=node:node --from=dev /app/packages/globals ./packages/globals
COPY --chown=node:node --from=dev /app/pnpm-workspace.yaml ./pnpm-workspace.yaml
COPY --chown=node:node --from=dev /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --chown=node:node --from=dev /app/tsconfig.base.json ./tsconfig.base.json

# Copy source code
COPY --chown=node:node ./packages/video-renderer ./packages/video-renderer
COPY --chown=node:node ./packages/common ./packages/common

# Build common package first
WORKDIR /app/packages/common
RUN ./node_modules/.bin/nest build

# Build video-renderer service
WORKDIR /app/packages/video-renderer
RUN ./node_modules/.bin/nest build

USER node

#
# Production Stage
#
FROM --platform=linux/amd64 node:20-alpine as prod

# Install FFmpeg and required libraries
RUN apk add --no-cache ffmpeg libc6-compat libcap

WORKDIR /app

ENV NODE_ENV production

# Allow non-root to bind to privileged ports if needed
RUN setcap 'cap_net_bind_service=+ep' `readlink -f \`which node\``

# Copy only necessary files from build stage
COPY --chown=node:node --from=build /app/node_modules ./node_modules
COPY --chown=node:node --from=build /app/packages/common/dist ./packages/common
COPY --chown=node:node --from=build /app/packages/common/package.json ./packages/common/package.json
COPY --chown=node:node --from=build /app/packages/common/node_modules ./packages/common/node_modules

COPY --chown=node:node --from=build /app/packages/video-renderer/dist ./packages/video-renderer/dist
COPY --chown=node:node --from=build /app/packages/video-renderer/package.json ./packages/video-renderer/package.json
COPY --chown=node:node --from=build /app/packages/video-renderer/node_modules ./packages/video-renderer/node_modules

COPY --chown=node:node --from=build /app/packages/globals ./packages/globals

# Create directory for temporary video processing
RUN mkdir -p /tmp/render-jobs && chown node:node /tmp/render-jobs

USER node

WORKDIR /app/packages/video-renderer

EXPOSE 3001

CMD ["node", "dist/main"]
