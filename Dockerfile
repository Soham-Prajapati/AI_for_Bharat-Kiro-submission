# ============================================================
# KLA Content Intelligence Platform — Production Dockerfile
# Multi-stage build for minimal image size (~120MB vs ~900MB)
# ============================================================

# ---- Stage 1: Build ----
FROM node:20-alpine AS builder
WORKDIR /app

# Install dependencies first (cached layer)
COPY package.json package-lock.json ./
RUN npm ci

# Copy source and compile TypeScript
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm run build

# ---- Stage 2: Production ----
FROM node:20-alpine AS production
WORKDIR /app

# Security: run as non-root user
RUN addgroup -g 1001 -S kla && \
    adduser -S kla -u 1001

# Install only production dependencies
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy compiled output from builder
COPY --from=builder /app/dist ./dist

# Create uploads directory for local fallback
RUN mkdir -p uploads && chown -R kla:kla /app

USER kla

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:${PORT:-8080}/health || exit 1

EXPOSE ${PORT:-8080}

# Graceful shutdown support
STOPSIGNAL SIGTERM

CMD ["node", "dist/index.js"]
