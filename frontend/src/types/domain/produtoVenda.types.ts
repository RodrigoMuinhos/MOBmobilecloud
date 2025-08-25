// src/types/domain/produtoVenda.ts

export interface ProdutoVenda {
  id: string;
  nome: string;
  unidade: string;
  quantidade: number;
  preco: number;
  desconto?: number;
    codigo?: string;
  precoUnitario?: number;
  subtotal?: number;
}
