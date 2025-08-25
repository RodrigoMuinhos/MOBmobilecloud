// /types/api/recomendacaoApi.types.ts

import { ProdutoAPI } from './produtoApi.types';

export interface RecomendacaoAPI {
  id?: string;
  clienteId: string;
  texto: string;
  data: string;
  produtosRelacionados: ProdutoAPI[];
}
