import { api } from '@/lib/api';
import { calcSubtotal, calcTotalFinal, hidratarCarrinho } from '@/lib/calculos';

export type StatusPagamento = 'PENDENTE' | 'PAGO' | 'CANCELADO';
export type FormaPagamento = 'PIX' | 'CREDITO' | 'DEBITO' | 'DINHEIRO' | 'BOLETO' | string;
export type TipoUnidade = 'UN' | 'CX' | 'KIT' | string;

export interface ItemCarrinho {
  produtoId: string;
  nome: string;
  tipoSelecionado: TipoUnidade;
  quantidade: number;
  precoUnitario: number;
  subtotal?: number;
}
export interface Venda {
  id: string;
  clienteId: string | null;
  clienteNome?: string | null;
  dataVenda: string;
  carrinho: ItemCarrinho[];
  subtotal: number;
  descontoValor: number;
  descontoMotivo?: string | null;
  frete: number;
  totalFinal: number;
  forma_pagamento: FormaPagamento;
  status_pagamento: StatusPagamento;
  vendedorId?: string | null;
  filialId?: string | null;
}

function mapVendaApi(v: Venda): Venda {
  const carrinho = hidratarCarrinho(v.carrinho || []);
  const subtotal = calcSubtotal(carrinho);
  const totalFinal = calcTotalFinal(subtotal, v.descontoValor || 0, v.frete || 0);
  return { ...v, carrinho, subtotal, totalFinal };
}

export async function listarVendas(params?: Record<string, any>): Promise<Venda[]> {
  const { data } = await api.get('/vendas', { params });
  return (data as Venda[]).map(mapVendaApi);
}
export async function obterVenda(id: string): Promise<Venda> {
  const { data } = await api.get(`/vendas/${id}`);
  return mapVendaApi(data);
}
export async function criarVenda(payload: Omit<Venda, 'id' | 'subtotal' | 'totalFinal' | 'dataVenda'>) {
  const { data } = await api.post('/vendas', payload);
  return mapVendaApi(data);
}
export async function alterarStatusPagamento(id: string, status: StatusPagamento) {
  const { data } = await api.patch(`/vendas/${id}/status`, { status });
  return mapVendaApi(data);
}
