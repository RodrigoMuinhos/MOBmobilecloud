import { CartItem } from '../../types/domain/carrinho';

export function calcularSubtotal(itens: CartItem[]): number {
  return itens.reduce((acc, item) => acc + item.quantidade * item.precoUnitario, 0);
}
