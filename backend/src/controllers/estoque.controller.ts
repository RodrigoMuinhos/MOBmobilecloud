// src/controllers/estoque.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma';

// GET /api/estoques?filialId=...
export const listarEstoques = async (req: Request, res: Response) => {
  try {
    const { filialId } = req.query as { filialId?: string };
    const where = filialId ? { filialId: String(filialId) } : {};

    const estoques = await prisma.estoque.findMany({
      where,
      orderBy: { nome: 'asc' },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        observacoes: true,
        filialId: true,
      },
    });

    res.json(estoques);
  } catch (e) {
    console.error('listarEstoques', e);
    res.status(500).json({ erro: 'Falha ao listar estoques.' });
  }
};

// POST /api/estoques
// { nome, cidade, estado?, observacoes?, filialId }
export const criarEstoque = async (req: Request, res: Response) => {
  try {
    const { nome, cidade, estado, observacoes, filialId } = req.body || {};

    if (!nome || !cidade || !filialId) {
      return res.status(400).json({ erro: 'nome, cidade e filialId são obrigatórios.' });
    }

    // garante que a filial existe
    const filial = await prisma.filial.findUnique({ where: { id: String(filialId) } });
    if (!filial) return res.status(404).json({ erro: 'Filial não encontrada.' });

    const novo = await prisma.estoque.create({
      data: {
        nome: String(nome).trim(),
        cidade: String(cidade).trim(),
        estado: estado ? String(estado).trim() : null,
        observacoes: observacoes ? String(observacoes).trim() : null,
        filialId: String(filialId),
      },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        observacoes: true,
        filialId: true,
      },
    });

    res.status(201).json(novo);
  } catch (e) {
    console.error('criarEstoque', e);
    res.status(500).json({ erro: 'Falha ao criar estoque.' });
  }
};

// PUT /api/estoques/:id
export const atualizarEstoque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nome, cidade, estado, observacoes } = req.body || {};

    const existe = await prisma.estoque.findUnique({ where: { id } });
    if (!existe) return res.status(404).json({ erro: 'Estoque não encontrado.' });

    const up = await prisma.estoque.update({
      where: { id },
      data: {
        ...(nome !== undefined ? { nome: String(nome).trim() } : {}),
        ...(cidade !== undefined ? { cidade: String(cidade).trim() } : {}),
        ...(estado !== undefined ? { estado: estado ? String(estado).trim() : null } : {}),
        ...(observacoes !== undefined ? { observacoes: observacoes ? String(observacoes).trim() : null } : {}),
      },
      select: {
        id: true,
        nome: true,
        cidade: true,
        estado: true,
        observacoes: true,
        filialId: true,
      },
    });
    res.json(up);
  } catch (e) {
    console.error('atualizarEstoque', e);
    res.status(500).json({ erro: 'Falha ao atualizar estoque.' });
  }
};

// DELETE /api/estoques/:id
export const deletarEstoque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existe = await prisma.estoque.findUnique({ where: { id } });
    if (!existe) return res.status(404).json({ erro: 'Estoque não encontrado.' });

    await prisma.estoque.delete({ where: { id } });
    res.status(204).send();
  } catch (e: any) {
    // P2003 = violação de FK (estoque com produtos/movimentos)
    if (e?.code === 'P2003') {
      return res.status(409).json({ erro: 'Não é possível excluir: estoque em uso.' });
    }
    console.error('deletarEstoque', e);
    res.status(500).json({ erro: 'Falha ao excluir estoque.' });
  }
};

// GET /api/estoques/:id/resumo
export const resumoEstoque = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const itens = await prisma.produtoEstoque.findMany({
      where: { estoqueId: String(id) },
      select: {
        quantidade_em_estoque: true,
        unidades_por_caixa: true,
        caixas: true,
        preco_venda_unidade: true,
        preco_venda_caixa: true,
      },
    });

    let totalUnidades = 0;
    let valorTotal = 0;

    for (const it of itens) {
      const unidadesSoltas = it.quantidade_em_estoque ?? 0;
      const unidadesPorCaixa = it.unidades_por_caixa ?? 0;
      const caixas = it.caixas ?? 0;

      const unidadesEmCaixas = caixas * unidadesPorCaixa;
      const unidadesTotais = unidadesSoltas + unidadesEmCaixas;

      const precoUn = it.preco_venda_unidade ?? 0;
      const precoCx = it.preco_venda_caixa ?? 0;

      const valorCaixas = precoCx > 0 ? caixas * precoCx : unidadesEmCaixas * precoUn;
      const valorUnidadesSoltas = unidadesSoltas * precoUn;

      totalUnidades += unidadesTotais;
      valorTotal += valorCaixas + valorUnidadesSoltas;
    }

    res.json({ totalUnidades, valorTotal });
  } catch (e) {
    console.error('resumoEstoque', e);
    res.status(500).json({ erro: 'Falha ao gerar resumo do estoque.' });
  }
};
