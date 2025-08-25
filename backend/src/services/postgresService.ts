// src/services/postgresService.ts
import { Pool } from 'pg';

export const pool = new Pool({
  user: 'seu_usuario',
  host: 'localhost',
  database: 'mob_supply',
  password: 'sua_senha',
  port: 5432, // porta padrão do PostgreSQL
});
