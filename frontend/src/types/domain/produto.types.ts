export type Produto = {
  id: string;
  quantidade_em_estoque: number;
  nome: string;
  marca?: string;
  categoria?: string;
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
