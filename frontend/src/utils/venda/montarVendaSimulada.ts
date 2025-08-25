import { Cliente } from '../../types/domain/cliente.types';
import { CartItem } from '../../types/domain/carrinho';
import { Venda } from '../../types/domain/venda.types';

export function montarVendaSimulada(
  cliente: Cliente,
  carrinho: CartItem[],
  dadosFinanceiros: any
): Venda {
  const produtosConvertidos = carrinho.map((item) => ({
    id: item.id,
    nome: item.nome,
    unidade: item.unidade || 'un',
    quantidade: item.quantidade || 1,
    preco: item.precoUnitario || 0,
    desconto: item.desconto || 0,
  }));

  return {
    id: `simulado-${Date.now()}`,
    numero: Date.now(),
    dataVenda: new Date().toISOString(),
    cpf: cliente?.cpf || '',
    clienteId: cliente?.id || '',
    clienteNome: cliente?.nome || '',
    carrinho, // ✅ Adicionado: agora o recibo pode acessar corretamente os itens

    subtotal: dadosFinanceiros.subtotal || 0,
    total: dadosFinanceiros.totalFinal || 0,
    totalFinal: dadosFinanceiros.totalFinal || 0,
    desconto_aplicado: dadosFinanceiros.descontoValor || 0,
    descontoPercentual: dadosFinanceiros.descontoPercentual || 0,
    descontoValor: dadosFinanceiros.descontoValor || 0,
    destinoDesconto: dadosFinanceiros.destinoDesconto || '',
    frete: dadosFinanceiros.frete || 0,
    acrescimo: dadosFinanceiros.acrescimo || 0,
    parcelas: dadosFinanceiros.parcelas || 1,
    formaPagamento: dadosFinanceiros.formaPagamento || '',
    forma_pagamento: String(dadosFinanceiros.formaPagamento || ''),
    status_pagamento: 'pendente',
    criadoEm: new Date().toISOString(),
    atualizadoEm: new Date().toISOString(),
    novaVenda: 1,
    vendedorId: cliente?.vendedorId || '',
    observacoes: '',
    data: new Date().toISOString(),
  };
}
