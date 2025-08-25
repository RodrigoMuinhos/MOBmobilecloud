export type ItemEstoque = {
  id?: string;
  codigo?: string;
  nome: string;
  marca?: string;
  tipo?: string;

  preco_compra?: number | null;
  preco_venda_caixa?: number | null;
  preco_venda_unidade?: number | null;

  quantidade_em_estoque?: number | null;
  unidades_por_caixa?: number | null;

  preco_caixa?: number;
  preco_unit?: number;
  caixas?: number;
  qtdCaixas?: number;
  valorPago?: number;
  valorVenda?: number;

  grupo?: string;
};

export type EstoqueBanco = {
  [categoria: string]: {
    [tipo: string]: ItemEstoque[];
  };
};
