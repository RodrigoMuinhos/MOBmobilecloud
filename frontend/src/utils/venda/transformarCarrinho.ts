import { CartItem } from '../../types/domain/carrinho'; // caminho ajustado para seu projeto

interface ProdutoVenda {
  codigo: string;
  nome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}

/**
 * Converte um array de CartItem para o formato esperado de produtos na venda.
 */
export function transformarCarrinho(carrinho: CartItem[]): ProdutoVenda[] {
  return carrinho.map((item) => {
    const codigo = item.codigo || '---';
    const nome = item.nome || 'Produto sem nome';
    const quantidade = item.quantidade || 1;
    const precoUnitario = item.precoUnitario || 0;

    return {
      codigo,
      nome,
      quantidade,
      precoUnitario,
      subtotal: quantidade * precoUnitario,
    };
  });
}
