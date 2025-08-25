import { Request, Response } from 'express';
import { prisma } from '../prisma'; // ajuste conforme estrutura real do seu projeto

// GET /api/filiais
export async function listarFiliais(req: Request, res: Response) {
  try {
    const filiais = await prisma.filial.findMany({
      where: { ativa: true },
      orderBy: { nome: 'asc' },
    });
    res.json(filiais);
  } catch (error) {
    console.error('Erro ao listar filiais:', error);
    res.status(500).json({ error: 'Erro ao listar filiais' });
  }
}

// GET /api/filiais/:id
export async function obterFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const filial = await prisma.filial.findUnique({ where: { id } });

    if (!filial) return res.status(404).json({ error: 'Filial não encontrada' });

    res.json(filial);
  } catch (error) {
    console.error('Erro ao buscar filial:', error);
    res.status(500).json({ error: 'Erro ao buscar filial' });
  }
}

// POST /api/filiais
export async function criarFilial(req: Request, res: Response) {
  try {
    const { nome, uf, slug, corHex, icone } = req.body;

    const nova = await prisma.filial.create({
      data: {
        nome,
        uf,
        slug,
        corHex,
        icone,
      },
    });

    res.status(201).json(nova);
  } catch (error) {
    console.error('Erro ao criar filial:', error);
    res.status(500).json({ error: 'Erro ao criar filial' });
  }
}

// PUT /api/filiais/:id
export async function atualizarFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { nome, uf, slug, corHex, icone, ativa } = req.body;

    const atualizada = await prisma.filial.update({
      where: { id },
      data: {
        nome,
        uf,
        slug,
        corHex,
        icone,
        ativa,
      },
    });

    res.json(atualizada);
  } catch (error) {
    console.error('Erro ao atualizar filial:', error);
    res.status(500).json({ error: 'Erro ao atualizar filial' });
  }
}

// DELETE /api/filiais/:id
export async function excluirFilial(req: Request, res: Response) {
  try {
    const { id } = req.params;

    await prisma.filial.delete({ where: { id } });

    res.status(204).send();
  } catch (error) {
    console.error('Erro ao excluir filial:', error);
    res.status(500).json({ error: 'Erro ao excluir filial' });
  }
}
