// Tipos mínimos que o frontend usa para renderizar
export type ProdutoEstoqueAPI = {
  id: string;
  codigo: string;
  nome: string;
  marca: string;                // = categoria
  tipo: string;
  preco_compra: number;
  preco_venda_unidade: number;
  preco_venda_caixa: number;
  quantidade_em_estoque: number;
  unidades_por_caixa: number;
  caixas?: number | null;
  filialId?: string | null;
};

// Item normalizado para a UI
export type ItemEstoque = ProdutoEstoqueAPI & {
  preco_unit: number;           // alias p/ preco_venda_unidade
  preco_caixa: number;          // alias p/ preco_venda_caixa
  caixas: number;               // sempre numérico
  unidades_por_caixa: number;   // sempre numérico
  quantidade_em_estoque: number;// sempre numérico
};

// Estrutura agrupada: categoria(marca) -> tipo -> itens
export type EstoqueBanco = Record<string, Record<string, ItemEstoque[]>>;
