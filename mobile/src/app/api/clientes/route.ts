import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import { randomUUID } from 'crypto';

type Cliente = {
  id: string;
  nome: string;
  cpf?: string;
  whatsapp?: string;
  nascimento?: string; // YYYY-MM-DD
  cep?: string;
  logradouro?: string;
  numero?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
};

// GET /api/clientes?q=... | ?search=... | ?busca=...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || searchParams.get('search') || searchParams.get('busca') || '')
    .trim()
    .toLowerCase();

  if (!q) {
    const rows = db.prepare(`SELECT * FROM clientes ORDER BY created_at DESC LIMIT 50`).all() as Cliente[];
    return NextResponse.json(rows, { status: 200 });
  }

  // procura por nome (like), cpf e whatsapp (dígitos)
  const like = `%${q}%`;
  const digits = q.replace(/\D+/g, '');
  const rows = db
    .prepare(
      `
      SELECT * FROM clientes
      WHERE lower(nome) LIKE ? 
         OR replace(replace(replace(cpf, '.', ''), '-', ''), ' ', '') LIKE ?
         OR replace(replace(replace(whatsapp, '(', ''), ')', ''), '-', '') LIKE ?
      ORDER BY created_at DESC
      LIMIT 50
    `
    )
    .all(like, `%${digits}%`, `%${digits}%`) as Cliente[];

  return NextResponse.json(rows, { status: 200 });
}

// POST /api/clientes  { nome, cpf?, whatsapp?, ... }
export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<Cliente>;
    const id = randomUUID();

    const stmt = db.prepare(`
      INSERT INTO clientes (
        id, nome, cpf, whatsapp, nascimento, cep,
        logradouro, numero, bairro, cidade, uf
      ) VALUES (@id, @nome, @cpf, @whatsapp, @nascimento, @cep,
        @logradouro, @numero, @bairro, @cidade, @uf
      )
    `);

    stmt.run({
      id,
      nome: String(body.nome || '').trim(),
      cpf: body.cpf || null,
      whatsapp: body.whatsapp || null,
      nascimento: body.nascimento || null,
      cep: body.cep || null,
      logradouro: body.logradouro || null,
      numero: body.numero || null,
      bairro: body.bairro || null,
      cidade: body.cidade || null,
      uf: body.uf || null,
    });

    const created = db.prepare(`SELECT * FROM clientes WHERE id = ?`).get(id) as Cliente;
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ erro: 'Falha ao salvar cliente (local).' }, { status: 500 });
  }
}
