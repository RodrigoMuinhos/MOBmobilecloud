// backend/src/controllers/venda.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { v4 as uuidv4 } from 'uuid';
import type { Prisma } from '../generated/prisma';

// ---------- helpers ----------
const n2 = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const toStr = (v: any, def = '') => (v === undefined || v === null ? def : String(v));

// Enum inferido do input do modelo (funciona com qualquer versão gerada do Prisma)
type StatusPagamentoEnum = Prisma.VendaCreateInput['status_pagamento'];

const toStatusEnum = (s: any): StatusPagamentoEnum => {
  const up = String(s ?? '').toUpperCase();
  if (up === 'PAGO') return 'PAGO' as StatusPagamentoEnum;
  if (up === 'CANCELADO') return 'CANCELADO' as StatusPagamentoEnum;
  return 'PENDENTE' as StatusPagamentoEnum;
};

// ---------- Listar ----------
export const listarVendas = async (_req: Request, res: Response) => {
  try {
    const vendas = await prisma.venda.findMany({
      orderBy: { data: 'desc' },
      include: { cliente: true, filial: true },
    });
    res.json(vendas);
  } catch (erro) {
    console.error('Erro ao listar vendas:', erro);
    res.status(500).json({ erro: 'Erro ao buscar vendas.' });
  }
};

// ---------- Buscar por ID ----------
export const getVendaById = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { cliente: true, filial: true },
    });
    if (!venda) return res.status(404).json({ erro: 'Venda não encontrada.' });
    res.json(venda);
  } catch (erro) {
    console.error('Erro ao buscar venda por ID:', erro);
    res.status(500).json({ erro: 'Erro ao buscar a venda.' });
  }
};

// ---------- Criar ----------
export const salvarVenda = async (req: Request, res: Response) => {
  const {
    // ids
    clienteId,
    filialId,

    // itens (JSON)
    carrinho,

    // totais
    subtotal,
    totalFinal,
    descontoPercentual = 0,
    descontoValor = 0,
    destinoDesconto = null,
    frete = 0,
    acrescimo = 0,

    // pagamento (aceita snake e camel)
    forma_pagamento,
    formaPagamento,

    status_pagamento,
    statusPagamento,

    parcelas = null,

    // observações (snake e camel)
    observacao,
    observacoes,
  } = req.body ?? {};

  // Resolver finais
  const formaPagamentoFinal = toStr(formaPagamento ?? forma_pagamento ?? 'Pix');
  const statusPagamentoFinal = toStatusEnum(statusPagamento ?? status_pagamento ?? 'PENDENTE');
  const observacoesFinal = toStr(observacoes ?? observacao ?? '');

  // Validação básica com retorno do que faltou
  const faltando: string[] = [];
  if (!clienteId) faltando.push('clienteId');
  if (!filialId) faltando.push('filialId');
  if (!Array.isArray(carrinho) || carrinho.length === 0) faltando.push('carrinho');
  if (!Number.isFinite(Number(totalFinal))) faltando.push('totalFinal');

  if (faltando.length) {
    return res.status(400).json({
      erro: 'Dados da venda incompletos ou inválidos.',
      faltando,
    });
  }

  try {
    // preencher clienteNome (obrigatório no schema)
    const cliente = await prisma.cliente.findUnique({
      where: { id: String(clienteId) },
      select: { nome: true },
    });
    const clienteNome = toStr(cliente?.nome, '');

    const novaVenda = await prisma.venda.create({
      data: {
        id: uuidv4(),
        data: new Date(),

        // relações/ids
        clienteId: String(clienteId),
        clienteNome,
        filialId: String(filialId),

        // JSON dos itens
        carrinho,

        // totais
        subtotal: n2(subtotal),
        totalFinal: n2(totalFinal),
        descontoPercentual: n2(descontoPercentual),
        descontoValor: n2(descontoValor),
        destinoDesconto: destinoDesconto ? String(destinoDesconto) : null,
        frete: n2(frete),
        acrescimo: n2(acrescimo),

        // nomes conforme schema
        formaPagamento: formaPagamentoFinal,      // String
        status_pagamento: statusPagamentoFinal,   // Enum
        parcelas: parcelas === null ? null : Number(parcelas),

        // String não nula
        observacoes: observacoesFinal,
      },
    });

    res.status(201).json({
      mensagem: 'Venda registrada com sucesso.',
      id: novaVenda.id,
    });
  } catch (erro: any) {
    console.error('Erro ao salvar venda:', erro);
    if (erro?.issues) {
      return res.status(400).json({ erro: 'Validação falhou', issues: erro.issues });
    }
    res.status(500).json({ erro: 'Erro ao salvar a venda.' });
  }
};

// ---------- Deletar ----------
export const deletarVenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const venda = await prisma.venda.delete({ where: { id } });
    res.status(200).json(venda);
  } catch (erro) {
    console.error('Erro ao deletar venda:', erro);
    res.status(500).json({ erro: 'Erro ao deletar venda.' });
  }
};

// ---------- Atualizar ----------
export const atualizarVenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados = { ...(req.body ?? {}) };

  // nomes e tipos
  if ('forma_pagamento' in dados && !('formaPagamento' in dados)) {
    dados.formaPagamento = toStr(dados.forma_pagamento);
    delete dados.forma_pagamento;
  }

  if ('status_pagamento' in dados) {
    dados.status_pagamento = toStatusEnum(dados.status_pagamento);
  }
  if ('statusPagamento' in dados) {
    dados.status_pagamento = toStatusEnum(dados.statusPagamento);
    delete dados.statusPagamento;
  }

  if ('observacao' in dados && !('observacoes' in dados)) {
    dados.observacoes = toStr(dados.observacao, '');
    delete dados.observacao;
  }
  if ('observacoes' in dados) {
    dados.observacoes = toStr(dados.observacoes, '');
  }

  // números
  if ('subtotal' in dados) dados.subtotal = n2(dados.subtotal);
  if ('totalFinal' in dados) dados.totalFinal = n2(dados.totalFinal);
  if ('descontoPercentual' in dados) dados.descontoPercentual = n2(dados.descontoPercentual);
  if ('descontoValor' in dados) dados.descontoValor = n2(dados.descontoValor);
  if ('frete' in dados) dados.frete = n2(dados.frete);
  if ('acrescimo' in dados) dados.acrescimo = n2(dados.acrescimo);
  if ('parcelas' in dados) dados.parcelas = dados.parcelas === null ? null : n2(dados.parcelas);

  if ('destinoDesconto' in dados && dados.destinoDesconto != null) {
    dados.destinoDesconto = toStr(dados.destinoDesconto);
  }

  try {
    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: dados,
    });
    res.status(200).json(vendaAtualizada);
  } catch (erro) {
    console.error('Erro ao atualizar venda:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar venda.' });
  }
};
