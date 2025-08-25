import { Request, Response } from 'express';
import { prisma } from '../prisma'; // Ajuste conforme o caminho correto
import { v4 as uuidv4 } from 'uuid';

// 🔹 Listar todas as vendas (mais recentes primeiro)
export const listarVendas = async (_req: Request, res: Response) => {
  try {
    const vendas = await prisma.venda.findMany({
      orderBy: { data: 'desc' },  // Ordena as vendas pela data (mais recentes primeiro)
      include: { cliente: true, filial: true }, // Incluindo os dados do cliente e da filial
    });

    res.json(vendas);
  } catch (erro) {
    console.error('Erro ao listar vendas:', erro);
    res.status(500).json({ erro: 'Erro ao buscar vendas.' });
  }
};

// 🔹 Buscar uma venda específica por ID
export const getVendaById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const venda = await prisma.venda.findUnique({
      where: { id },
      include: { cliente: true, filial: true }, // Incluindo a filial também
    });

    if (!venda) {
      return res.status(404).json({ erro: 'Venda não encontrada.' });
    }

    res.json(venda);
  } catch (erro) {
    console.error('Erro ao buscar venda por ID:', erro);
    res.status(500).json({ erro: 'Erro ao buscar a venda.' });
  }
};

// 🔹 Criar uma nova venda
export const salvarVenda = async (req: Request, res: Response) => {
  const {
    cliente,
    carrinho,
    descontoPercentual = 0,
    descontoValor = 0,
    destinoDesconto,
    frete = 0,
    acrescimo = 0,
    formaPagamento,
    parcelas,
    totalFinal,
    filialId,  // Recebendo o filialId no corpo da requisição
    observacoes = '',  // Observações com valor padrão
  } = req.body;

  // Validação para garantir dados completos
  if (!cliente?.id || !cliente?.nome || !Array.isArray(carrinho) || carrinho.length === 0 || !totalFinal || !filialId) {
    return res.status(400).json({ erro: 'Dados da venda incompletos ou inválidos.' });
  }

  // Validar totalFinal é um número
  if (isNaN(totalFinal)) {
    return res.status(400).json({ erro: 'Valor totalFinal inválido.' });
  }

  // Calcular o subtotal manualmente
  const subtotal = carrinho.reduce((acc: number, item: any) => {
    const preco = parseFloat(item.preco || item.preco_unitario || 0);
    const qtd = parseInt(item.quantidade || 1);

    // Garantir que os valores de preco e quantidade sejam válidos
    if (isNaN(preco) || isNaN(qtd)) {
      throw new Error('Preço ou quantidade inválidos no carrinho.');
    }

    return acc + preco * qtd;
  }, 0);

  try {
    const novaVenda = await prisma.venda.create({
      data: {
        id: uuidv4(),  // Gerando um ID único para a venda
        data: new Date(),  // Data e hora da venda
        clienteId: cliente.id,  // Relacionando o cliente
        clienteNome: cliente.nome,  // Nome do cliente
        carrinho,  // Carrinho de itens
        subtotal,  // Subtotal calculado
        descontoPercentual,
        descontoValor,
        destinoDesconto: destinoDesconto || null,
        frete,
        acrescimo,
        formaPagamento,
        parcelas,
        totalFinal,
        status_pagamento: 'PENDENTE',  // Status de pagamento inicial
        observacoes,  // Observações passadas no corpo da requisição
        cliente: {
          connect: { id: cliente.id },  // Conectando o cliente existente
        },
        filial: {
          connect: { id: filialId },  // Conectando a filial existente
        },
      },
    });

    res.status(201).json({
      mensagem: 'Venda registrada com sucesso.',
      id: novaVenda.id,
    });
  } catch (erro) {
    console.error('Erro ao salvar venda:', erro);
    res.status(500).json({ erro: 'Erro ao salvar a venda.' });
  }
};

// 🔹 Deletar uma venda pelo ID
export const deletarVenda = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const venda = await prisma.venda.delete({
      where: { id },
    });
    res.status(200).json(venda);
  } catch (erro) {
    console.error('Erro ao deletar venda:', erro);
    res.status(500).json({ erro: 'Erro ao deletar venda.' });
  }
};

// 🔹 Atualizar uma venda pelo ID
export const atualizarVenda = async (req: Request, res: Response) => {
  const { id } = req.params;
  const dadosVenda = req.body;

  try {
    const vendaAtualizada = await prisma.venda.update({
      where: { id },
      data: dadosVenda,
    });
    res.status(200).json(vendaAtualizada);
  } catch (erro) {
    console.error('Erro ao atualizar venda:', erro);
    res.status(500).json({ erro: 'Erro ao atualizar venda.' });
  }
};
