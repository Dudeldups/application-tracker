# ---------- Build frontend ----------
FROM node:22-alpine AS web-builder

ARG APP_VERSION=local

WORKDIR /app/apps/web

COPY apps/web/package*.json ./
RUN npm ci --no-audit --no-fund

COPY apps/web ./

# Empty API URL means the built frontend calls /api/... on the same host.
ENV VITE_API_URL=
RUN echo "Building web version: $APP_VERSION" && npm run build


# ---------- Build API ----------
FROM node:22-alpine AS api-builder

ARG APP_VERSION=local

WORKDIR /app/apps/api

COPY apps/api/package*.json ./
RUN npm ci --no-audit --no-fund

COPY apps/api ./
RUN echo "Building api version: $APP_VERSION" && npm run build


# ---------- Production runtime ----------
FROM node:22-alpine AS runner

WORKDIR /app/apps/api

ENV NODE_ENV=production
ENV PORT=3000
ENV STATIC_DIR=/app/public

COPY apps/api/package*.json ./
RUN npm ci --omit=dev --no-audit --no-fund

COPY --from=api-builder /app/apps/api/dist ./dist
COPY --from=api-builder /app/apps/api/prisma ./prisma
COPY --from=api-builder /app/apps/api/prisma.config.ts ./prisma.config.ts

COPY --from=web-builder /app/apps/web/dist /app/public

EXPOSE 3000

CMD ["sh", "-c", "npm run db:migrate && npm run start"]