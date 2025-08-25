import { ProdutoEstoqueAPI } from '../types/api/produtoEstoqueApi.types';
import { ItemEstoque } from '../types/domain/estoque.types';

/**
 * ✅ Converte um item da API (ProdutoEstoqueAPI) para o frontend (ItemEstoque)
 * - Normaliza valores numéricos
 * - Garante que `caixas` e `totais` sejam sempre válidos
 */
export function mapEstoqueApiToDomain(api: ProdutoEstoqueAPI): ItemEstoque {
  const unidadesPorCaixa = Number(api.unidades_por_caixa) || 1;
  const quantidadeTotal = Number(api.quantidade_em_estoque) || 0;
  const precoCaixa = Number(api.preco_venda_caixa) || 0;
  const precoUnit = Number(api.preco_venda_unidade) || 0;

  return {
    id: api.id,
    codigo: api.codigo,
    nome: api.nome ?? '',
    marca: api.marca ?? '',
    tipo: api.tipo ?? '',

    preco_compra: Number(api.preco_compra) || 0,
    preco_venda_caixa: precoCaixa,
    preco_venda_unidade: precoUnit,

    quantidade_em_estoque: quantidadeTotal,
    unidades_por_caixa: unidadesPorCaixa,

    caixas: Math.floor(quantidadeTotal / unidadesPorCaixa),

    // auxiliares para cálculos e exibição
    preco_caixa: precoCaixa,
    preco_unit: precoUnit,
    valorPago: precoCaixa * Math.floor(quantidadeTotal / unidadesPorCaixa),
    valorVenda: precoUnit * quantidadeTotal,
  };
}

/**
 * ✅ Converte um item do frontend (ItemEstoque) para a API (ProdutoEstoqueAPI)
 * - Ignora campos auxiliares (como `preco_caixa`, `valorPago`, etc.)
 */
export function mapEstoqueDomainToApi(domain: ItemEstoque): ProdutoEstoqueAPI {
  return {
    id: domain.id,
    codigo: domain.codigo,
    nome: domain.nome,
    marca: domain.marca,
    tipo: domain.tipo,

    preco_compra: domain.preco_compra ?? undefined,
    preco_venda_caixa: domain.preco_venda_caixa ?? undefined,
    preco_venda_unidade: domain.preco_venda_unidade ?? undefined,

    quantidade_em_estoque: domain.quantidade_em_estoque ?? undefined,
    unidades_por_caixa: domain.unidades_por_caixa ?? undefined,

    // campos calculados são ignorados
  };
}
