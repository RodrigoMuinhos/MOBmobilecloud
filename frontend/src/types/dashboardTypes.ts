// Tipos centralizados para o Dashboard do MOBsupply

export type VendasMes = {
  mes: string;
  valor: number;
};

export type VendasDia = {
  dia: string;
  valor: number;
};

export type ProdutoTop = {
  nome: string;
  quantidade: number;
};

export type CategoriaEstoque = {
  categoria: string;
  quantidade: number;
};

export type MaiorComprador = {
  nome: string;
  total: number;
};