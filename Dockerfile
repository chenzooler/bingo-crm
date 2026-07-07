# ====== Bingo CRM Production Dockerfile ======
# Built for Coolify / production deployment with Next.js standalone output.

# ---- Stage 1: Dependencies ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# ---- Stage 2: Build ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
RUN npm run build

# ---- Stage 3: Runner ----
FROM node:22-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build (much smaller than full node_modules)
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder /app/research ./research

# Run migrations + seed on container start. Needs the prisma CLI, tsx, the
# generated client and the seed sources — so overlay the FULL node_modules
# (from builder, after `prisma generate`) on top of the standalone one.
# Bigger image, but startup is self-healing: a fresh/behind DB gets schema+seed.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.ts ./prisma.config.ts
COPY --from=builder --chown=nextjs:nodejs /app/lib ./lib

USER nextjs

EXPOSE 3000

# migrate deploy = additive schema sync; the seed is idempotent (upserts only,
# never overwrites UI edits) — if it fails we log and still start the server.
CMD ["sh", "-c", "./node_modules/.bin/prisma migrate deploy && (./node_modules/.bin/tsx prisma/seed.ts || echo 'seed failed - continuing') && node server.js"]
