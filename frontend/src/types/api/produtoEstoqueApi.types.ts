// src/types/api/produtoEstoqueApi.types.ts
export interface ProdutoEstoqueAPI {
  id?: string;

  // dados de identificação
  estoqueId?: string | null;     // ✅ necessário p/ POST/DELETE por grupo
  filialId?: string | null;      // opcional, útil p/ relatórios
  categoriaId?: string | null;   // opcional, se usar no front
  criado_em?: string | null;     // opcional

  // descrição
  nome?: string;
  codigo?: string;
  marca?: string;
  tipo?: string;

  // quantidades e preços
  caixas?: number | null;
  unidades_por_caixa?: number | null;
  quantidade_em_estoque?: number | null;

  preco_compra?: number | null;
  preco_venda_caixa?: number | null;
  preco_venda_unidade?: number | null;

  // campos derivados de UI (se você usar)
  precoCaixa?: number;
  precoUnitario?: number;
  subtotal?: number;
}
