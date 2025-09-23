import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'app.db');

// garante pasta
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);

// cria tabela se não existir
db.exec(`
  CREATE TABLE IF NOT EXISTS clientes (
    id TEXT PRIMARY KEY,
    nome TEXT NOT NULL,
    cpf TEXT,
    whatsapp TEXT,
    nascimento TEXT,
    cep TEXT,
    logradouro TEXT,
    numero TEXT,
    bairro TEXT,
    cidade TEXT,
    uf TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_clientes_nome ON clientes (nome);
  CREATE INDEX IF NOT EXISTS idx_clientes_cpf ON clientes (cpf);
  CREATE INDEX IF NOT EXISTS idx_clientes_whatsapp ON clientes (whatsapp);
`);

export default db;
