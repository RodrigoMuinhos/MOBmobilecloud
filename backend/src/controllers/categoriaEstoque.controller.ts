// src/controllers/categoriaEstoque.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma';

// normaliza strings (tira espaços duplicados, etc.)
const norm = (s: string) => s.normalize('NFKC').trim().replace(/\s+/g, ' ');

// mapeia campos do BD -> API
const mapDBtoAPI = (r: { id: string; marca: string; tipo: string; filialId: string }) => ({
  id: r.id,
  categoria: r.marca,
  tipo: r.tipo,
  filialId: r.filialId,
});

// GET /api/categoriaestoque?filialId=...
export async function listarCategoriasEstoque(req: Request, res: Response) {
  try {
    const filialId = typeof req.query.filialId === 'string' ? req.query.filialId.trim() : '';

    const rows = await prisma.categoriaEstoque.findMany({
      where: filialId ? { filialId } : undefined,
      orderBy: [{ marca: 'asc' }, { tipo: 'asc' }],
      select: { id: true, marca: true, tipo: true, filialId: true },
    });

    return res.json(rows.map(mapDBtoAPI));
  } catch (e) {
    console.error('listarCategoriasEstoque', e);
    return res.status(500).json({ message: 'Erro ao listar categorias' });
  }
}

// POST /api/categoriaestoque
export async function criarCategoriaEstoque(req: Request, res: Response) {
  try {
    // aceita `categoria` (API) ou `marca` (legado)
    const categoriaRaw = String(req.body?.categoria ?? req.body?.marca ?? '').trim();
    const tipoRaw      = String(req.body?.tipo ?? '').trim();
    const filialId     = String(req.body?.filialId ?? '').trim(); // ← obrigatório

    if (!categoriaRaw || !tipoRaw || !filialId) {
      return res
        .status(400)
        .json({ message: 'categoria, tipo e filialId são obrigatórios.' });
    }

    const categoria = norm(categoriaRaw);
    const tipo      = norm(tipoRaw);

    // ✅ idempotente: se existir, retorna; se não, cria
    const row = await prisma.categoriaEstoque.upsert({
      where: { marca_tipo_filial: { marca: categoria, tipo, filialId } }, // mesmo nome/ordem do @@unique
      update: {},
      create: { marca: categoria, tipo, filialId },
      select: { id: true, marca: true, tipo: true, filialId: true },
    });

    return res.status(200).json(mapDBtoAPI(row));
  } catch (e: any) {
    console.error('criarCategoriaEstoque', e?.message || e);
    return res.status(500).json({ message: 'Erro ao criar categoria' });
  }
}

// DELETE /api/categoriaestoque/:id
export async function deletarCategoriaEstoque(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const cat = await prisma.categoriaEstoque.findUnique({ where: { id } });
    if (!cat) return res.status(404).json({ message: 'Categoria não encontrada' });

    await prisma.categoriaEstoque.delete({ where: { id } });
    return res.status(204).send();
  } catch (e: any) {
    console.error('deletarCategoriaEstoque', e);

    // FK constraint (há produtos vinculados)
    if (e?.code === 'P2003') {
      return res.status(409).json({ message: 'Categoria possui produtos vinculados.' });
    }
    return res.status(500).json({ message: 'Erro ao excluir categoria' });
  }
}
