-- Lista todas as colunas filialId que NÃO são UUID
SELECT table_schema, table_name, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name = 'filialId'
  AND data_type <> 'uuid'
ORDER BY table_name;