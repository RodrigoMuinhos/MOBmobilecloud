// src/types/domain/carrinho.types.ts

export type CartItem = {
  id: string;
  codigo: string;
  nome: string;
  tipo: 'caixa' | '5un' | 'unidade';
  precoUnitario: number;
  quantidade: number;
  subtotal: number;

  // Campos auxiliares (opcionais)
  unidade?: string;
  marca?: string;
  desconto?: number;
  quantidade_em_estoque?: number | null;
};
