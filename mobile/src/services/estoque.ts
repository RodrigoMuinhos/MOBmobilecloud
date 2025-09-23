import { api } from '@/services/api';

export type NovoEstoquePayload = {
  filialId: string;
  marca?: string | null;
  nome: string;
  codigo?: string | null;
  tipo: 'RL' | 'PR' | 'SC' | 'OT';
  unidades_por_caixa: number;
  preco_venda_unidade: number;
  preco_venda_caixa: number;
  quantidade_unidades: number;
};

export async function criarProdutoEstoque(p: NovoEstoquePayload) {
  return api.post('/produtoestoque', p);
}
