-- Tipo atual da coluna
SELECT data_type
FROM information_schema.columns
WHERE table_schema='public' AND table_name='CategoriaEstoque' AND column_name='filialId';

-- Valores que NÃO batem com padrão de UUID (se existirem)
SELECT DISTINCT "filialId"
FROM "CategoriaEstoque"
WHERE "filialId" IS NOT NULL
  AND NOT ("filialId" ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$');