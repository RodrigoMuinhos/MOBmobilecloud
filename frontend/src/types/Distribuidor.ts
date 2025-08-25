export type Distribuidor = {
  id: string;
  nome: string;
  wpp: string;
  telefone: string;
  email: string;
  endereco: string;
  bairro: string;
  cidade: string;
  estado: string;
  cep: string;
  cpf: string;
  nascimento: string;
  studio: string;
  uf: string;
};

export type Produto = {
  id: string;
  codigo: string;
  modelo: string;
  qtd: number;
  valorVenda: number;
  frete: number;
};

export type Lote = {
  key: string;
  data: string;
  nome: string;
  estoques: Produto[];
  totalCaixas: number;
  totalValor: number;
};