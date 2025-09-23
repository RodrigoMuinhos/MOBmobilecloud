import type { DestinoDesconto, FormaPagamento } from '@/services/vendas';

export type CheckoutDraft = {
  descontoStr: string;
  freteStr: string;
  destinoDesc: DestinoDesconto;
  pgto: FormaPagamento;
  parcelas?: number;
  obs?: string;
};

const KEY = 'ms_checkout';

export function getDraft(): CheckoutDraft {
  try { const raw = sessionStorage.getItem(KEY); if (raw) return JSON.parse(raw); } catch {}
  return { descontoStr: '0', freteStr: '0', destinoDesc: 'CLIENTE', pgto: 'PIX', parcelas: 1, obs: '' };
}

export function saveDraft(patch: Partial<CheckoutDraft>): CheckoutDraft {
  const cur = getDraft(); const next = { ...cur, ...patch };
  try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch {}
  return next;
}

export function clearDraft() { try { sessionStorage.removeItem(KEY); } catch {} }
