import { ProdutoEstoqueAPI } from '../types';
import { CartItem } from '../types/domain/carrinho';

export function toCartItem(
  p: ProdutoEstoqueAPI,
  tipo: 'caixa' | '5un' | 'unidade'
): CartItem {
  const precoCaixa = Number(p.preco_venda_caixa) || 0;
  const unidPorCaixa = Number(p.unidades_por_caixa) || 1;

  const precoUnitario =
    tipo === 'caixa'
      ? precoCaixa
      : tipo === '5un'
      ? (precoCaixa / unidPorCaixa) * 5
      : precoCaixa / unidPorCaixa;

  return {
    id: p.id ?? p.codigo ?? String(Date.now()),
    codigo: p.codigo ?? '',
    nome: p.nome ?? '',
    marca: p.marca ?? '',
    tipo,
    quantidade: 1,
    precoUnitario,
    subtotal: parseFloat((precoUnitario * 1).toFixed(2)),
    quantidade_em_estoque: p.quantidade_em_estoque ?? 0,
  };
}
