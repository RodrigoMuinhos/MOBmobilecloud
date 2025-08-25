import { VendaAPI, ItemCarrinhoAPI } from '../types/api/vendaApi.types';
import { Venda, ItemCarrinho } from '../types/domain/venda.types';

/**
 * API → Domínio
 */
export function mapVendaApiToDomain(api: VendaAPI): Venda {
  const carrinho: ItemCarrinho[] = (api.carrinho ?? []).map((item, i): ItemCarrinho => {
    const precoTotal = Number(item.preco) || 0;
    const quantidade = Number(item.quantidade) || 1;
    const precoUnitario = precoTotal / quantidade;

    console.log(`🛒 Item ${i} do carrinho (API → Domínio):`, {
      nome: item.nome,
      quantidadeOriginal: item.quantidade,
      precoOriginal: item.preco,
      quantidade,
      precoUnitario,
    });

    return {
      nome: item.nome,
      quantidade,
      precoUnitario,
    };
  });

  const venda: Venda = {
    id: api.id ?? '',
    numero: 0,
    cpf: '',
    clienteId: api.cliente?.id ?? api.clienteId ?? '',
    clienteNome: api.cliente?.nome ?? api.clienteNome ?? 'Cliente não identificado',
    carrinho,
    dataVenda: api.data ?? '',
    formaPagamento: Number(api.formaPagamento) || 0,
    parcelas: api.parcelas ?? 1,
    subtotal: Number(api.subtotal) || 0,
    total: Number(api.totalFinal ?? (Number(api.subtotal) - Number(api.descontoValor))) || 0,
    totalFinal: Number(api.totalFinal) || 0,
    descontoPercentual: Number(api.descontoPercentual) || 0,
    descontoValor: Number(api.descontoValor) || 0,
destinoDesconto: (() => {
  if (!api.destinoDesconto) return { id: '', nome: '' };

  if (typeof api.destinoDesconto === 'string') {
    // Vem direto como nome
    return { id: '', nome: api.destinoDesconto };
  }

  // Caso objeto, mas pode estar mal formatado
  return {
    id: api.destinoDesconto.id ?? '',
    nome: api.destinoDesconto.nome ?? '',
  };
})(),

    frete: Number(api.frete) || 0,
    acrescimo: Number(api.acrescimo) || 0,
    forma_pagamento: api.formaPagamento ?? '',
    status_pagamento: api.status_pagamento ?? 'pendente',
    criadoEm: api.criadoEm ?? '',
    atualizadoEm: api.atualizadoEm ?? '',
    vendedorId: '',
    observacoes: '',
    novaVenda: 0,
    desconto_aplicado: 0,
    data: api.data ?? '',
  };

  console.log('📦 Venda mapeada (API → Domínio):', venda);

  return venda;
}

/**
 * Domínio → API
 */
export function mapVendaToApi(venda: Venda): VendaAPI {
  const api: VendaAPI = {
    id: venda.id,
    clienteId: venda.clienteId,
    clienteNome: venda.clienteNome,
    carrinho: (venda.carrinho ?? []).map((item, i): ItemCarrinhoAPI => {
      const precoTotal = item.precoUnitario * item.quantidade;

      console.log(`🧾 Item ${i} do carrinho (Domínio → API):`, {
        ...item,
        precoTotal,
      });

      return {
        nome: item.nome,
        quantidade: item.quantidade,
        preco: precoTotal,
         tipoUnidade: item.tipoUnidade ?? '',
      };
    }),
    data: venda.data,
    formaPagamento: venda.forma_pagamento,
    parcelas: venda.parcelas,
    subtotal: venda.subtotal,
    descontoPercentual: venda.descontoPercentual,
    descontoValor: venda.descontoValor,
    destinoDesconto: {
  id: venda.destinoDesconto?.id ?? '',
  nome: venda.destinoDesconto?.nome ?? '',
},
    frete: venda.frete,
    acrescimo: venda.acrescimo,
    totalFinal: venda.totalFinal,
    criadoEm: venda.criadoEm,
    atualizadoEm: venda.atualizadoEm,
    status_pagamento: venda.status_pagamento,
  };

  console.log('📤 Venda mapeada (Domínio → API):', api);

  return api;
}
