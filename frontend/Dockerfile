# =============================================================================
# Stage 1 – Builder
# Installs deps and creates the Next.js production build.
# NEXT_PUBLIC_* variables are baked into the JS bundle at build time,
# so they must be passed as build args here (not at runtime).
# =============================================================================
FROM node:20-slim AS builder

WORKDIR /app

# NEXT_PUBLIC_API_BASE_URL is baked into client-side JS at build time.
# Override this build arg if your backend is not at localhost:5001.
ARG NEXT_PUBLIC_API_BASE_URL=http://localhost:5001/api
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL

ENV NEXT_TELEMETRY_DISABLED=1

COPY package*.json ./
RUN npm ci

# Copy all frontend source files
COPY . .

# next.config.ts sets output: "standalone" which produces a lean
# self-contained server under .next/standalone/
RUN npm run build


# =============================================================================
# Stage 2 – Runner
# The standalone output bundles its own trimmed node_modules so no
# npm install is needed here. Image is much smaller than a full install.
# =============================================================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# The standalone server and its minimal node_modules
COPY --from=builder /app/.next/standalone ./

# Static files must sit at .next/static inside the standalone directory
COPY --from=builder /app/.next/static ./.next/static

# Public assets (favicon, manifest, etc.)
COPY --from=builder /app/public ./public

EXPOSE 3000

# server.js is the standalone Next.js server entry point
CMD ["node", "server.js"]
