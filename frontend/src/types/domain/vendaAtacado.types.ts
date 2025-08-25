import { Produto } from './produto.types';

export type VendaAtacado = {
  id: string;
  clienteId: string;
  produtos: Produto[];
  valorTotal: number;
  criadoEm: string;
  status: 'pendente' | 'confirmado' | 'cancelado';
};
