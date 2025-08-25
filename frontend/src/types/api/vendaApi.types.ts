import { ClienteAPI } from './clienteApi.types';

// Tipagem para os itens do carrinho
export interface ItemCarrinhoAPI {
  nome: string;
  quantidade: number;
  precoUnitario?: number;
  marca?: string;
  preco: number;
  tipoUnidade?: string;
  
}

export interface VendaAPI {
  id?: string;
  data?: string; // Ex: "2025-07-25T14:30:00.000Z"
  
  clienteId: string;
  clienteNome: string;
  cliente?: ClienteAPI;

  carrinho: ItemCarrinhoAPI[];

  subtotal: number;
  descontoPercentual: number;
  descontoValor: number;
  destinoDesconto: string | { id: string; nome: string };

  frete: number;
  acrescimo: number;

  formaPagamento: string;
  parcelas?: number;

  totalFinal: number;

  criadoEm?: string;
  atualizadoEm?: string;
  status_pagamento?: 'pago' | 'pendente' | 'cancelado';
}
