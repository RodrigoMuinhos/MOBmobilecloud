import { Cliente } from './cliente.types';

// Tipagem para os itens do carrinho no domínio
export type ItemCarrinho = {

  nome: string;
  quantidade: number;
  precoUnitario: number; 
   tipoUnidade?: string;
}

// Tipagem principal para uma venda no domínio
export interface Venda {
  id: string;
  numero: number;
  cpf: string;

  clienteId: string;
  clienteNome: string;
   cliente?: Cliente;
  carrinho: ItemCarrinho[];

  dataVenda: string;
  data: string;

  formaPagamento: number;
  forma_pagamento: string;
  parcelas: number;

  subtotal: number;
  total: number;
  totalFinal: number;
  marca?: string;
  descontoPercentual: number;
  descontoValor: number;
  destinoDesconto: { id: string; nome: string };

  frete: number;
  acrescimo: number;

  status_pagamento: 'pago' | 'pendente' | 'cancelado';

  criadoEm: string;
  atualizadoEm: string;

  vendedorId: string;
  observacoes: string;
  novaVenda: number;
  desconto_aplicado: number;
}
