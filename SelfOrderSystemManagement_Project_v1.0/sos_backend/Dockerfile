# syntax=docker/dockerfile:1

FROM node:22-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm config set registry https://registry.npmjs.org/ \
  && npm config set fetch-retries 5 \
  && npm config set fetch-retry-mintimeout 20000 \
  && npm config set fetch-retry-maxtimeout 120000 \
  && npm config set fetch-timeout 600000 \
  && npm ci --no-audit --fund=false --prefer-offline

COPY prisma ./prisma
COPY prisma.config.ts ./

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres?schema=public"

RUN npx prisma generate

COPY src ./src

RUN npm prune --omit=dev


FROM node:22-alpine AS production

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=5000

RUN addgroup -S sos && adduser -S sos -G sos

COPY --from=build --chown=sos:sos /app/package*.json ./
COPY --from=build --chown=sos:sos /app/node_modules ./node_modules
COPY --from=build --chown=sos:sos /app/src ./src
COPY --from=build --chown=sos:sos /app/prisma ./prisma
COPY --from=build --chown=sos:sos /app/prisma.config.ts ./prisma.config.ts

RUN mkdir -p /app/public/uploads/menu-items && chown -R sos:sos /app/public

USER sos

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT || 5000) + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"

CMD ["node", "src/server.js"]
