# ======================= #
#       BUILD STAGE       #
# ======================= #
FROM node:20-alpine AS build
WORKDIR /app/backend

# Ferramentas só para compilar dependências nativas (ex.: bcrypt)
RUN apk add --no-cache --virtual .build-deps python3 make g++ \
  && apk add --no-cache openssl

# 1) deps
COPY backend/package*.json ./
RUN npm ci

# 2) prisma
COPY backend/prisma ./prisma
RUN npx prisma generate

# 3) código
COPY backend/ .
RUN npm run build

# 4) produzir node_modules só de produção
RUN npm prune --omit=dev

# ======================= #
#      RUNTIME STAGE      #
# ======================= #
FROM node:20-alpine
ENV NODE_ENV=production
ENV PORT=3333

WORKDIR /app/backend

# runtime libs
RUN apk add --no-cache openssl

# Copia artefatos prontos do build
COPY --from=build /app/backend/dist ./dist
COPY --from=build /app/backend/prisma ./prisma
COPY --from=build /app/backend/node_modules ./node_modules
COPY --from=build /app/backend/package*.json ./

# uploads (pasta pública)
RUN mkdir -p /app/backend/uploads

# entrypoint
COPY docker/api-entrypoint.sh /usr/local/bin/api-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/api-entrypoint.sh \
 && chmod +x /usr/local/bin/api-entrypoint.sh

EXPOSE 3333
ENTRYPOINT ["/usr/local/bin/api-entrypoint.sh"]
