// backend/src/controllers/venda.controller.ts
import { Request, Response } from 'express';

import { v4 as uuidv4 } from 'uuid';
import type { Prisma } from '@prisma/client';
import { prisma } from '../prisma';


// ---------- helpers ----------
const n2 = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};
const toStr = (v: any, def = '') => (v === undefined || v === null ? def : String(v));

// Enum inferido do input do modelo (compatível com versões geradas)
type StatusPagamentoEnum = Prisma.VendaCreateInput['status_pagamento'];

const toStatusEnum = (s: any): StatusPagamentoEnum => {
  const up = String(s ?? '').toUpperCase();
  if (up === 'PAGO') return 'PAGO' as StatusPagamentoEnum;
  if (up === 'CANCELADO') return 'CANCELADO' as StatusPagamentoEnum;
  return 'PENDENTE' as StatusPagamentoEnum; // default
};

// Campos permitidos para update parcial
const CAMPOS_ATUALIZAVEIS = new Set([
  'status_pagamento',
  'formaPagamento',
  'subtotal',
  'totalFinal',
  'descontoPercentual',
  'descontoValor',
  'destinoDesconto',
  'frete',
  'acrescimo',
  'parcelas',
  'observacoes',
  'carrinho', // se precisar atualizar itens
]);

const filtrarPermitidos = (dados: Record<string, any>) => {
  const out: Record<string, any> = {};
  Object.keys(dados).forEach((k) => {
    if (CAMPOS_ATUALIZAVEIS.has(k) && dados[k] !== undefined) {
      out[k] = dados[k];
    }
  });
  return out;
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
    clienteId,
    filialId,
    carrinho,
    subtotal,
    totalFinal,
    descontoPercentual = 0,
    descontoValor = 0,
    destinoDesconto = null,
    frete = 0,
    acrescimo = 0,
    forma_pagamento,
    formaPagamento,
    status_pagamento,
    statusPagamento,
    parcelas = null,
    observacao,
    observacoes,
  } = req.body ?? {};

  const formaPagamentoFinal = toStr(formaPagamento ?? forma_pagamento ?? 'Pix');
  const statusPagamentoFinal = toStatusEnum(statusPagamento ?? status_pagamento ?? 'PENDENTE');
  const observacoesFinal = toStr(observacoes ?? observacao ?? '');

  const faltando: string[] = [];
  if (!clienteId) faltando.push('clienteId');
  if (!filialId) faltando.push('filialId');
  if (!Array.isArray(carrinho) || carrinho.length === 0) faltando.push('carrinho');
  if (!Number.isFinite(Number(totalFinal))) faltando.push('totalFinal');

  if (faltando.length) {
    return res.status(400).json({ erro: 'Dados da venda incompletos ou inválidos.', faltando });
  }

  try {
    const cliente = await prisma.cliente.findUnique({
      where: { id: String(clienteId) },
      select: { nome: true },
    });
    const clienteNome = toStr(cliente?.nome, '');

    const novaVenda = await prisma.venda.create({
      data: {
        id: uuidv4(),
        data: new Date(),
        clienteId: String(clienteId),
        clienteNome,
        filialId: String(filialId),
        carrinho,
        subtotal: n2(subtotal),
        totalFinal: n2(totalFinal),
        descontoPercentual: n2(descontoPercentual),
        descontoValor: n2(descontoValor),
        destinoDesconto: destinoDesconto ? String(destinoDesconto) : null,
        frete: n2(frete),
        acrescimo: n2(acrescimo),
        formaPagamento: formaPagamentoFinal,
        status_pagamento: statusPagamentoFinal,
        parcelas: parcelas === null ? null : Number(parcelas),
        observacoes: observacoesFinal,
      },
    });

    res.status(201).json({ mensagem: 'Venda registrada com sucesso.', id: novaVenda.id });
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
  } catch (erro: any) {
    if (erro?.code === 'P2025') {
      return res.status(404).json({ erro: 'Venda não encontrada.' });
    }
    console.error('Erro ao deletar venda:', erro);
    res.status(500).json({ erro: 'Erro ao deletar venda.' });
  }
};

// ---------- Atualizar (PUT/PATCH parcial) ----------
export const atualizarVenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dados = { ...(req.body ?? {}) };

  // snake -> camel
  if ('forma_pagamento' in dados && !('formaPagamento' in dados)) {
    dados.formaPagamento = toStr(dados.forma_pagamento);
    delete dados.forma_pagamento;
  }

  // status (aceita qualquer case/alias)
  if ('status_pagamento' in dados) {
    dados.status_pagamento = toStatusEnum(dados.status_pagamento);
  }
  if ('statusPagamento' in dados) {
    dados.status_pagamento = toStatusEnum(dados.statusPagamento);
    delete dados.statusPagamento;
  }

  // observações
  if ('observacao' in dados && !('observacoes' in dados)) {
    dados.observacoes = toStr(dados.observacao, '');
    delete dados.observacao;
  }
  if ('observacoes' in dados) {
    dados.observacoes = toStr(dados.observacoes, '');
  }

  // numéricos
  if ('subtotal' in dados) dados.subtotal = n2(dados.subtotal);
  if ('totalFinal' in dados) dados.totalFinal = n2(dados.totalFinal);
  if ('descontoPercentual' in dados) dados.descontoPercentual = n2(dados.descontoPercentual);
  if ('descontoValor' in dados) dados.descontoValor = n2(dados.descontoValor);
  if ('frete' in dados) dados.frete = n2(dados.frete);
  if ('acrescimo' in dados) dados.acrescimo = n2(dados.acrescimo);
  if ('parcelas' in dados) dados.parcelas = dados.parcelas === null ? null : n2(dados.parcelas);

  // strings opcionais
  if ('destinoDesconto' in dados && dados.destinoDesconto != null) {
    dados.destinoDesconto = toStr(dados.destinoDesconto);
  }

  // carrinho (se enviado, precisa ser array/json válido)
  if ('carrinho' in dados && !Array.isArray(dados.carrinho)) {
    delete dados.carrinho; // ignora formato inválido para evitar 500
  }

  // whitelisting
  const data = filtrarPermitidos(dados);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ erro: 'Nenhum campo válido para atualizar.' });
  }

  try {
    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data,
    });
    res.status(200).json(vendaAtualizada);
  } catch (erro: any) {
    if (erro?.code === 'P2025') {
      return res.status(404).json({ erro: 'Venda não encontrada.' });
    }
    console.error('Erro ao atualizar venda:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar venda.' });
  }
};

// PATCH reutiliza a mesma lógica do PUT
export const atualizarParcialVenda = async (req: Request, res: Response) => {
  return atualizarVenda(req, res);
};

// ---------- Endpoint dedicado: atualizar somente o status ----------
export const atualizarStatusVenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  let { status_pagamento } = req.body ?? {};

  try {
    if (!status_pagamento) {
      return res.status(400).json({ erro: "Campo 'status_pagamento' é obrigatório." });
    }

    status_pagamento = toStatusEnum(status_pagamento);

    const venda = await prisma.venda.update({
      where: { id },
      data: { status_pagamento },
    });

    return res.json({
      mensagem: 'Status atualizado com sucesso.',
      id: venda.id,
      status_pagamento: venda.status_pagamento,
    });
  } catch (erro: any) {
    if (erro?.code === 'P2025') {
      return res.status(404).json({ erro: 'Venda não encontrada.' });
    }
    console.error('Erro ao atualizar status da venda:', erro);
    return res.status(500).json({ erro: 'Erro ao atualizar status da venda.' });
  }
};
