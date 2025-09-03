#!/bin/sh
set -eu

POSTGRES_HOST="${POSTGRES_HOST:-db}"
POSTGRES_PORT="${POSTGRES_PORT:-5432}"
POSTGRES_USER="${POSTGRES_USER:-postgres}"
POSTGRES_DB="${POSTGRES_DB:-mobsupply}"

echo "⏳ Aguardando Postgres em ${POSTGRES_HOST}:${POSTGRES_PORT}..."
max_retries=120
count=0
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB"; do
  count=$((count+1))
  [ $count -ge $max_retries ] && echo "Timeout aguardando Postgres." && exit 1
  sleep 1
  printf "."
done
echo
echo "✅ Postgres pronto"

echo "📦 prisma generate"
npx prisma generate || true

echo "🧱 prisma migrate deploy"
npx prisma migrate deploy

if [ "${RUN_SEED:-false}" = "true" ]; then
  echo "🌱 prisma db seed"
  npx prisma db seed
fi

echo "🚀 Iniciando API..."
exec npm run start:prod
