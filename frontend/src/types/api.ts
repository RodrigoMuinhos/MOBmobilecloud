// src/types/api.ts

export interface ProdutoEstoqueAPI {
  id: string;
  categoria: string;
  tipo: string;
  marca: string;
  modelo?: string;
  caixas: number;
  unidades_por_caixa: number;
  preco_caixa: number;
  observacoes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClienteAPI {
  id: string;
  nome: string;
  cpf: string;
  data_nascimento?: string;
  cidade?: string;
  estado?: string;
  telefone?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VendaAPI {
  id: string;
  clienteId: string;
  clienteNome: string;
  produtos: any[]; // ou ProdutoEstoqueAPI[]
  total: number;
  status_pagamento: 'pago' | 'pendente' | 'cancelado';
  createdAt: string;
}
