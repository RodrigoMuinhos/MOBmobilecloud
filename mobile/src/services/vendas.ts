// mobile/src/services/vendas.ts
import { api } from '@/services/api';

/* -------------------------------------------------------------------------- */
/*                                   Tipos                                    */
/* -------------------------------------------------------------------------- */

export type FormaPagamento = 'PIX' | 'DINHEIRO' | 'CREDITO' | 'DEBITO' | 'OUTRO';
export type DestinoDesconto = 'CLIENTE' | 'EMPRESA' | 'CUPOM';

export type ProdutoAPI = {
  id: string;
  nome: string;
  marca?: string;
  tipoPadrao?: string;
  preco?: number;
  precoUnitario?: number;
  unidade?: string;
};

export type ItemCarrinhoPayload = {
  /** ID do produto no backend */
  produtoId: string;
  /** Ex.: 'caixa' | '5un' | 'unidade' (opcional) */
  tipoSelecionado?: string | null;
  quantidade: number;
  precoUnitario: number;
};

export type NovaVendaPayload = {
  clienteId: string;
  filialId: string;
  carrinho: ItemCarrinhoPayload[];
  subtotal: number;
  descontoValor?: number;
  destinoDesconto?: DestinoDesconto;
  frete?: number;
  forma_pagamento: FormaPagamento;
  parcelas?: number;            // somente enviado em CREDITO
  acrescimoCredito?: number;    // somente enviado em CREDITO
  acrescimo?: number;           // alias p/ backend, quando aplicável
  totalFinal?: number;
  observacao?: string;          // enviamos apenas este campo
};

// Itens vindos da UI (como estão no contexto)
export type ItemCarrinhoUI = {
  id?: string;                        // id exibido na UI (às vezes é o mesmo do backend)
  produtoId?: string;                 // se a UI já tiver o id real do backend
  nome: string;
  tipoSelecionado?: string | null;
  quantidade: number;
  precoUnitario: number;
};

export type FinalizarVendaParams = {
  clienteId: string;
  filialId: string;
  carrinhoUI: ItemCarrinhoUI[];
  subtotal: number;
  descontoValor?: number;
  destinoDesconto?: DestinoDesconto;
  frete?: number;
  forma_pagamento: FormaPagamento;
  parcelas?: number | null;           // pode vir null da UI; omitimos se não for CREDITO
  acrescimoCredito?: number | null;   // idem
  totalFinal?: number;
  observacao?: string;                // UI pode enviar aqui…
  observacoes?: string;               // …ou aqui; consolidamos em 'observacao'
};

export type VendaCriada = { id: string };

/* -------------------------------------------------------------------------- */
/*                              Helpers / Errors                              */
/* -------------------------------------------------------------------------- */

function handle401(err: any) {
  if (err?.response?.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
  throw err;
}

function normalizeVendaId(resData: any): string {
  return String(
    resData?.id ??
    resData?.vendaId ??
    resData?.data?.id ??
    resData?.data?.vendaId ??
    Date.now()
  );
}

const num = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/** Remove recursivamente null/undefined do objeto */
function stripNulls<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj as T;
  if (Array.isArray(obj)) return obj.map(stripNulls) as unknown as T;
  if (typeof obj === 'object') {
    const out: any = {};
    Object.entries(obj as any).forEach(([k, v]) => {
      if (v === null || v === undefined) return;
      out[k] = stripNulls(v as any);
    });
    return out as T;
  }
  return obj as T;
}

/* -------------------------------------------------------------------------- */
/*                                Endpoints                                   */
/* -------------------------------------------------------------------------- */

export async function buscarProdutos(q: string): Promise<ProdutoAPI[]> {
  try {
    const { data } = await api.get('/produtos', { params: { q } });
    return Array.isArray(data) ? data : (data?.items ?? []);
  } catch (err: any) {
    handle401(err);
    return [];
  }
}

/** Post cru (payload já pronto) */
export async function criarVenda(payload: NovaVendaPayload) {
  try {
    const { data } = await api.post('/vendas', payload);
    return data;
  } catch (err: any) {
    handle401(err);
  }
}

/** Alto nível: recebe itens da UI, monta payload válido e retorna { id } */
export async function finalizarVenda(params: FinalizarVendaParams): Promise<VendaCriada> {
  const {
    clienteId,
    filialId,
    carrinhoUI,
    subtotal,
    descontoValor,
    destinoDesconto,
    frete,
    forma_pagamento,
    parcelas,
    acrescimoCredito,
    totalFinal,
    observacao,
    observacoes,
  } = params;

  const isCredito = forma_pagamento === 'CREDITO';

  // Observação consolidada (enviamos só 'observacao')
  const obs = (observacao && observacao.trim())
    || (observacoes && observacoes.trim())
    || undefined;

  const payload: NovaVendaPayload = {
    clienteId,
    filialId,
    carrinho: carrinhoUI.map((i) => ({
      // usa produtoId real se existir; fallback para id
      produtoId: String(i.produtoId ?? i.id ?? ''),
      tipoSelecionado: i.tipoSelecionado ?? null,
      quantidade: num(i.quantidade),
      precoUnitario: num(i.precoUnitario),
    })),
    subtotal: num(subtotal),
    descontoValor: descontoValor !== undefined ? num(descontoValor) : undefined,
    destinoDesconto,
    frete: frete !== undefined ? num(frete) : undefined,
    forma_pagamento,
    parcelas: isCredito ? num(parcelas ?? 1) : undefined, // omitimos quando não for crédito
    acrescimoCredito: isCredito && acrescimoCredito != null ? num(acrescimoCredito) : undefined,
    acrescimo: isCredito && acrescimoCredito != null ? num(acrescimoCredito) : undefined, // alias p/ back
    totalFinal: totalFinal !== undefined ? num(totalFinal) : undefined,
    observacao: obs,
  };

  // remove null/undefined para evitar 400/500 por campos nulos
  const safe = stripNulls(payload);

  try {
    const { data } = await api.post('/vendas', safe);
    return { id: normalizeVendaId(data) };
  } catch (err: any) {
    // Log útil para depurar no Console/Network
    // eslint-disable-next-line no-console
    console.error('[finalizarVenda] erro', {
      status: err?.response?.status,
      payload: safe,
      response: err?.response?.data,
    });
    throw err;
  }
}
