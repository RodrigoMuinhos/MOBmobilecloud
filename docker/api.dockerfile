FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=3333

WORKDIR /app/backend

# 0) toolchain p/ compilar dependências nativas (ex.: bcrypt)
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
 && apk add --no-cache openssl \
 # (opcional) só se seu entrypoint/healthcheck realmente usar:
 && apk add --no-cache --virtual .runtime-tools postgresql-client curl || true

# 1) deps
COPY backend/package*.json ./
# não instale devDeps no runtime
RUN npm ci --omit=dev --silent

# 2) prisma
COPY backend/prisma ./prisma
RUN npx prisma generate

# 3) código
COPY backend/ .
RUN npm run build

# 3.1) pasta pública p/ uploads (avatars etc.)
RUN mkdir -p /app/backend/uploads

# 3.2) remove toolchain de build (mantém só runtime)
RUN apk del .build-deps || true

# 4) entrypoint (garante LF e permissão)
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/api-entrypoint.sh \
 && chmod +x /usr/local/bin/api-entrypoint.sh

EXPOSE 3333
ENTRYPOINT ["/usr/local/bin/api-entrypoint.sh"]
