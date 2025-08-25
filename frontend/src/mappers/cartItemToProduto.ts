// src/mappers/cartItemToProduto.ts

import { CartItem } from '../types/domain/carrinho';

/**
 * Converte um array de CartItem para o formato usado na venda (para envio ao backend)
 */
export function mapCartItemsToProdutos(carrinho: CartItem[]): any[] {
  return carrinho.map((item) => ({
    id: item.id,
    nome: item.nome,
    unidade: item.unidade || 'un',
    quantidade: item.quantidade || 1,
    preco: item.precoUnitario || 0,
    desconto: item.desconto || 0,
    subtotal: item.subtotal || (item.precoUnitario || 0) * (item.quantidade || 1),
  }));
}
