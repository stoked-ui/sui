# Multi-stage build for optimized production image

# ─────────────────────────────────────────────────────────────────────────────
# Stage 1: Builder
# ─────────────────────────────────────────────────────────────────────────────

FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev

# Set working directory
WORKDIR /build

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install pnpm
RUN npm install -g pnpm

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
RUN pnpm build

# ─────────────────────────────────────────────────────────────────────────────
# Stage 2: Production Runtime
# ─────────────────────────────────────────────────────────────────────────────

FROM node:18-alpine

# Install runtime dependencies including ffmpeg
RUN apk add --no-cache \
    ffmpeg \
    curl \
    tini \
    dumb-init

# Create non-root user for security
RUN addgroup -g 1000 nodejs && \
    adduser -D -u 1000 -G nodejs nodejs

# Set working directory
WORKDIR /app

# Copy package files from builder
COPY --from=builder --chown=nodejs:nodejs /build/package.json /build/pnpm-lock.yaml ./

# Install pnpm in production image
RUN npm install -g pnpm

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod && \
    pnpm prune --prod

# Copy built application from builder
COPY --from=builder --chown=nodejs:nodejs /build/dist ./dist

# Create logs directory
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app/logs

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --retries=3 --start-period=40s \
    CMD curl -f http://localhost:3001/health || exit 1

# Use tini as PID 1 to handle signals properly
ENTRYPOINT ["/sbin/tini", "--"]

# Default command
CMD ["node", "dist/main.js"]

# Metadata labels
LABEL maintainer="Stoked UI Team"
LABEL version="0.1.0"
LABEL description="NestJS API for Stoked UI Media Components"
