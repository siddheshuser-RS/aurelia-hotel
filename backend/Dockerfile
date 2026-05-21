# =============================================================================
# Stage 1 – Builder
# Installs all deps, generates the Prisma client, and compiles TypeScript.
# =============================================================================
FROM node:20-slim AS builder

WORKDIR /app

# Prisma runtime detection can fail when the openssl binary is missing.
# Installing openssl keeps engine selection aligned with libssl3 on Bookworm.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Copy manifests first so Docker layer-caches the npm install step
COPY package*.json ./
COPY prisma ./prisma

# Install ALL deps (TypeScript + Prisma CLI are needed at build time)
RUN npm ci

# Generate Prisma client.
# binaryTargets in schema.prisma already includes "debian-openssl-3.0.x"
# which matches node:20-slim (Debian Bookworm). No extra flag needed.
RUN npx prisma generate

# Copy source and compile
COPY tsconfig.json ./
COPY src ./src
RUN npm run build


# =============================================================================
# Stage 2 – Runner
# Lean production image: only production node_modules + compiled output.
# =============================================================================
FROM node:20-slim AS runner

WORKDIR /app

ENV NODE_ENV=production

# Ensure openssl is present at runtime so Prisma detects libssl correctly.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends openssl \
	&& rm -rf /var/lib/apt/lists/*

# Install production deps only.
# "prisma" is now in dependencies (not devDependencies) so the CLI
# is available here for "prisma migrate deploy" at container startup.
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts

# Pull in the generated Prisma query engine from the builder stage
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Compiled server, migration files, and startup scripts
COPY --from=builder /app/dist ./dist
COPY prisma ./prisma
COPY scripts ./scripts

# The uploads directory is mounted as a named volume in docker-compose so
# files survive container restarts. Creating it here prevents a permissions
# error on first run if the volume is empty.
RUN mkdir -p /app/uploads

EXPOSE 5001

# Startup sequence:
#   1. db-prepare.cjs  – ensures DB exists, baselines migration if needed,
#                        then runs "prisma migrate deploy"
#   2. server.js       – starts the Express API (exec replaces the shell so
#                        SIGTERM is delivered directly to node for graceful shutdown)
CMD ["sh", "-c", "node scripts/db-prepare.cjs && exec node dist/src/server.js"]
