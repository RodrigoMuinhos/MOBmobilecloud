import { Produto } from './produto.types';

export type Recomendacao = {
  id: string;
  clienteId: string;
  texto: string;
  data: string;
  produtosRelacionados: Produto[];
};
