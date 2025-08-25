// types/api/produtoApi.types.ts

export type ProdutoAPI = {
  id: string;
  nome: string;
  marca?: string;
  unidade: string;
  tipo: 'caixa' | '5un' | 'unidade';
  quantidade: number;
  preco: number;
  desconto: number;
  precoOriginal?: number;
  precoCaixa?: number;
  precoUnidade?: number;
  preco5un?: number;
  custo?: number;
  personalizado?: boolean;
  codigo: string;
  precoUnitario: number;
  subtotal: number;
};

export interface CriarProdutoPayload {
  codigo?: string;
  nome: string;
  tipo?: string;
  marca?: string;
  preco_compra?: number | null;
  preco_venda_caixa?: number | null;
  preco_venda_unidade?: number | null;
  quantidade_em_estoque?: number | null;
  unidades_por_caixa?: number | null;
}

export interface AtualizarProdutoPayload extends Partial<CriarProdutoPayload> {
  id: string;
}
