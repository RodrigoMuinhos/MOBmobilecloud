// utils/financeiro/calcularResumoFinanceiro.ts
import { VendaAPI, ItemCarrinhoAPI } from '../../types/api/vendaApi.types';

interface ResumoFinanceiro {
  total: number;
  pago: number;
  aberto: number;
  desconto: number;
}

export const calcularResumoFinanceiro = (vendas: VendaAPI[]): ResumoFinanceiro => {
  let total = 0;
  let pago = 0;
  let aberto = 0;
  let desconto = 0;

  vendas.forEach((venda) => {
    const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];

    const subtotal = carrinho.reduce((acc, item) => {
      const qtd = Number(item.quantidade) || 0;
      const preco = Number(item.precoUnitario ?? item.preco) || 0;
      return acc + qtd * preco;
    }, 0);

    const frete = Number(venda.frete) || 0;
    const acrescimo = Number(venda.acrescimo) || 0;
    const desc = Number(venda.descontoValor) || 0;

    const valorFinal = subtotal - desc + frete + acrescimo;

    total += valorFinal;
    desconto += desc;

    if (venda.status_pagamento === 'pago') {
      pago += valorFinal;
    } else {
      aberto += valorFinal;
    }
  });

  return { total, pago, aberto, desconto };
};
