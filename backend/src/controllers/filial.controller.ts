import { Request, Response } from 'express';
import { prisma } from '../prisma';

// util simples p/ gerar slug a partir do nome
const makeSlug = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);

// GET /api/filiais
export async function listarFiliais(_req: Request, res: Response) {
  try {
    const filiais = await prisma.filial.findMany({
      where: { ativa: true },            // ajuste se seu schema não tiver "ativa"
      orderBy: { nome: 'asc' },
    });
    res.status(200).json(filiais);
  } catch (error) {
    console.error('listarFiliais', error);
    res.status(500).json({ error: 'Erro ao listar filiais' });
  }
}

// GET /api/filiais/:id
export async function obterFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const filial = await prisma.filial.findUnique({ where: { id } });
    if (!filial) return res.status(404).json({ error: 'Filial não encontrada' });
    res.status(200).json(filial);
  } catch (error) {
    console.error('obterFilial', error);
    res.status(500).json({ error: 'Erro ao buscar filial' });
  }
}

// POST /api/filiais
export async function criarFilial(req: Request, res: Response) {
  try {
    const { nome, uf, slug, corHex, icone, ativa } = req.body || {};
    if (!nome || String(nome).trim() === '') {
      return res.status(400).json({ error: 'nome é obrigatório.' });
    }

    const data: any = {
      nome: String(nome).trim(),
      ativa: typeof ativa === 'boolean' ? ativa : true,
    };
    if (uf) data.uf = String(uf).toUpperCase();
    if (corHex) data.corHex = String(corHex);
    if (icone) data.icone = String(icone);
    data.slug = slug && String(slug).trim() !== '' ? String(slug).trim() : makeSlug(data.nome);

    const nova = await prisma.filial.create({ data });
    res.status(201).json(nova);
  } catch (error: any) {
    console.error('criarFilial', error);
    if (error?.code === 'P2002') {
      return res.status(409).json({ error: 'Já existe uma filial com esse slug ou dados únicos.' });
    }
    res.status(500).json({ error: 'Erro ao criar filial' });
  }
}

// PUT /api/filiais/:id
export async function atualizarFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome, uf, slug, corHex, icone, ativa } = req.body || {};

    const data: any = {};
    if (nome !== undefined) data.nome = String(nome).trim();
    if (uf !== undefined) data.uf = String(uf).toUpperCase();
    if (corHex !== undefined) data.corHex = String(corHex);
    if (icone !== undefined) data.icone = String(icone);
    if (ativa !== undefined) data.ativa = !!ativa;
    if (slug !== undefined) {
      data.slug = String(slug).trim() || makeSlug(data.nome ?? (await prisma.filial.findUnique({ where: { id }, select: { nome: true } }))?.nome ?? 'filial');
    }

    const atualizada = await prisma.filial.update({ where: { id }, data });
    res.status(200).json(atualizada);
  } catch (error: any) {
    console.error('atualizarFilial', error);
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Filial não encontrada.' });
    if (error?.code === 'P2002') return res.status(409).json({ error: 'Slug já em uso.' });
    res.status(500).json({ error: 'Erro ao atualizar filial' });
  }
}

// DELETE /api/filiais/:id
export async function excluirFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    await prisma.filial.delete({ where: { id } });
    res.status(204).send();
  } catch (error: any) {
    console.error('excluirFilial', error);
    if (error?.code === 'P2025') return res.status(404).json({ error: 'Filial não encontrada.' });
    res.status(500).json({ error: 'Erro ao excluir filial' });
  }
}
