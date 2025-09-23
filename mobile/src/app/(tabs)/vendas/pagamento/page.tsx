'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import VendaMobileHeader from '@/components/VendaMobileHeader';
import { useVendaMobile } from '@/context/VendaMobileContext';
import { api } from '@/services/api';
import { ChevronRight } from 'lucide-react';

const ORANGE = '#F15A24';

/* ----------------------- helpers de moeda BRL ----------------------- */
const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

const onlyDigits = (s: string) => (s || '').replace(/\D+/g, '');

function maskBRLInput(raw: string): string {
  const d = onlyDigits(raw).replace(/^0+/, '') || '0';
  const padded = d.padStart(3, '0');
  const int = padded.slice(0, -2);
  const dec = padded.slice(-2);
  const intFmt = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${intFmt},${dec}`;
}
function parseBRLInput(masked: string): number {
  const d = onlyDigits(masked);
  if (!d) return 0;
  return Number(d) / 100;
}

/* ----------------------------- tipos ----------------------------- */
type Metodo = 'pix' | 'dinheiro' | 'credito' | 'debito' | 'outro';
type Vendedor = { id: string; nome: string; comissao?: number };

export default function PagamentoPage() {
  const { subtotal } = useVendaMobile(); // subtotal é número
  const sub = subtotal;

  // cliente vindo do passo anterior (opcional)
  const [clienteNome, setClienteNome] = useState<string>('-');
  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem('nv_cliente') || 'null');
      if (c?.nome) setClienteNome(c.nome as string);
    } catch {}
  }, []);

  /* ------------------------ VENDEDORES ------------------------ */
  const [vendedores, setVendedores] = useState<Vendedor[]>([]);
  const [vendedorId, setVendedorId] = useState('');
  const [vendMsg, setVendMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setVendMsg('');
        // tenta API
        const { data } = await api.get('/vendedores');
        if (!alive) return;
        if (Array.isArray(data) && data.length) {
          setVendedores(data as Vendedor[]);
          const last = localStorage.getItem('nv_vendedor_id') || (data[0] as any)?.id || '';
          setVendedorId(last);
          localStorage.setItem('nv_vendedores_cache', JSON.stringify(data));
          return;
        }
        throw new Error('vazio');
      } catch {
        // fallback: cache local ou um padrão
        if (!alive) return;
        const cache = localStorage.getItem('nv_vendedores_cache');
        if (cache) {
          const arr = JSON.parse(cache) as Vendedor[];
          setVendedores(arr);
          setVendedorId(localStorage.getItem('nv_vendedor_id') || arr[0]?.id || '');
        } else {
          const arr = [{ id: 'vend_padrao', nome: 'Vendedor Padrão' }];
          setVendedores(arr);
          setVendedorId(arr[0].id);
          setVendMsg('Lista de vendedores offline (padrão).');
        }
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  /* ------------------------ valores ------------------------ */
  const [descontoStr, setDescontoStr] = useState('0,00');
  const [freteStr, setFreteStr] = useState('0,00');
  const [pctAtivo, setPctAtivo] = useState<0 | 5 | 10 | null>(null);

  const desconto = parseBRLInput(descontoStr);
  const frete = parseBRLInput(freteStr);

  // total = sub - desconto + frete (nunca negativo)
  const total = useMemo(() => Math.max(0, sub - desconto + frete), [sub, desconto, frete]);

  function aplicarPct(p: 0 | 5 | 10) {
    setPctAtivo(p);
    const v = (sub * p) / 100;
    setDescontoStr(maskBRLInput(String(Math.round(v * 100))));
  }

  /* ------------------------ pagamento ------------------------ */
  const [metodo, setMetodo] = useState<Metodo>('pix');

  // campos condicionais
  const [pixChave, setPixChave] = useState('');
  const [dinheiroTrocoStr, setDinheiroTrocoStr] = useState('0,00');
  const [creditoBandeira, setCreditoBandeira] = useState('');
  const [creditoParcelas, setCreditoParcelas] = useState(1);

  // observações
  const [obs, setObs] = useState('');

  /* ------------------------ avançar ------------------------ */
  const podeAvancar = vendedorId && total >= 0;

  function avancar() {
    const vendedor = vendedores.find((v) => v.id === vendedorId);
    const payload = {
      cliente: clienteNome,
      vendedor: vendedor ? { id: vendedor.id, nome: vendedor.nome, comissao: vendedor.comissao } : null,
      desconto,
      frete,
      metodo,
      pixChave: metodo === 'pix' ? pixChave.trim() : undefined,
      dinheiroTroco: metodo === 'dinheiro' ? parseBRLInput(dinheiroTrocoStr) : undefined,
      credito: metodo === 'credito' ? { bandeira: creditoBandeira.trim(), parcelas: creditoParcelas } : undefined,
      obs: obs.trim(),
      total,
      subtotal: sub,
    };
    localStorage.setItem('nv_pagamento', JSON.stringify(payload));
    localStorage.setItem('nv_vendedor_id', vendedorId); // mantém última seleção
    location.href = '/vendas/finalizar';
  }

  const metodoBtn = (key: Metodo, label: string) => (
    <button
      type="button"
      onClick={() => setMetodo(key)}
      className={`rounded-full px-4 py-2 border text-sm transition ${
        metodo === key
          ? 'border-black bg-black text-white'
          : 'border-black/20 bg-white text-black hover:border-black/40'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="min-h-[100dvh] bg-[#F5F9F4] pb-28">
      <VendaMobileHeader titulo="Nova Venda — Pagamento" rightLink={{ href: '/', label: 'Início' }} />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* ----------------------- Cliente ----------------------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-xs text-black/60">Cliente</p>
              <p className="text-[15px] font-semibold text-black truncate">{clienteNome || '-'}</p>
            </div>
            <Link href="/vendas/cliente" className="text-sm underline underline-offset-2 text-black/70 hover:text-black">
              alterar
            </Link>
          </div>
        </div>

        {/* ----------------------- Vendedor responsável ----------------------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <label className="block text-sm text-black/70 mb-1">Vendedor responsável *</label>
          <select
            value={vendedorId}
            onChange={(e) => setVendedorId(e.target.value)}
            className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
          >
            {vendedores.map((v) => (
              <option key={v.id} value={v.id}>
                {v.nome}
              </option>
            ))}
          </select>
          {vendMsg && <p className="text-xs text-black/60 mt-2">{vendMsg}</p>}
        </div>

        {/* ----------------------- Valores ----------------------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-4">
          <div className="grid grid-cols-2 gap-3">
            {/* Desconto */}
            <div>
              <label className="block text-sm text-black/70 mb-1">Desconto (R$)</label>
              <input
                value={descontoStr}
                onChange={(e) => {
                  setDescontoStr(maskBRLInput(e.target.value));
                  setPctAtivo(null);
                }}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
              />
              <div className="mt-2 flex gap-2">
                {[0, 5, 10].map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => aplicarPct(p as 0 | 5 | 10)}
                    className={`rounded-lg px-2.5 py-1.5 text-sm border transition ${
                      pctAtivo === p
                        ? 'border-black bg-black text-white'
                        : 'border-black/20 bg-white text-black hover:border-black/40'
                    }`}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>

            {/* Frete */}
            <div>
              <label className="block text-sm text-black/70 mb-1">Frete (R$)</label>
              <input
                value={freteStr}
                onChange={(e) => setFreteStr(maskBRLInput(e.target.value))}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
              />
            </div>
          </div>

          {/* Resumo de valores */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <p className="text-black/60">Subtotal</p>
              <p className="font-semibold">{brl(sub)}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <p className="text-black/60">Desconto</p>
              <p className="font-semibold">- {brl(desconto)}</p>
            </div>
            <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3">
              <p className="text-black/60">Frete</p>
              <p className="font-semibold">{brl(frete)}</p>
            </div>
          </div>
        </div>

        {/* ----------------------- Forma de pagamento ----------------------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <p className="text-sm text-black/70">Forma de pagamento</p>
          <div className="flex flex-wrap gap-2">
            {metodoBtn('pix', 'PIX')}
            {metodoBtn('dinheiro', 'DINHEIRO')}
            {metodoBtn('credito', 'CRÉDITO')}
            {metodoBtn('debito', 'DÉBITO')}
            {metodoBtn('outro', 'OUTRO')}
          </div>

          {/* Campos condicionais */}
          {metodo === 'pix' && (
            <div className="mt-1">
              <label className="block text-sm text-black/70 mb-1">Chave PIX (opcional)</label>
              <input
                value={pixChave}
                onChange={(e) => setPixChave(e.target.value)}
                placeholder="email, CPF, telefone..."
                className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
              />
            </div>
          )}

          {metodo === 'dinheiro' && (
            <div className="mt-1">
              <label className="block text-sm text-black/70 mb-1">Troco para</label>
              <input
                value={dinheiroTrocoStr}
                onChange={(e) => setDinheiroTrocoStr(maskBRLInput(e.target.value))}
                onFocus={(e) => e.currentTarget.select()}
                className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
              />
            </div>
          )}

          {metodo === 'credito' && (
            <div className="mt-1 grid grid-cols-2 gap-3">
              <label className="block">
                <span className="block text-sm text-black/70 mb-1">Bandeira</span>
                <input
                  value={creditoBandeira}
                  onChange={(e) => setCreditoBandeira(e.target.value)}
                  placeholder="Visa, Master..."
                  className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
                />
              </label>
              <label className="block">
                <span className="block text-sm text-black/70 mb-1">Parcelas</span>
                <select
                  value={creditoParcelas}
                  onChange={(e) => setCreditoParcelas(Number.parseInt(e.target.value))}
                  className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
                >
                  {Array.from({ length: 12 }).map((_, i) => (
                    <option key={i + 1} value={i + 1}>
                      {i + 1}x
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}
        </div>

        {/* ----------------------- Observações ----------------------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <label className="block text-sm text-black/70 mb-1">Observações</label>
          <textarea
            value={obs}
            onChange={(e) => setObs(e.target.value)}
            placeholder="Ex.: entregar amanhã"
            rows={3}
            className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
          />
        </div>

        {/* Acesso rápido ao total */}
        <Link
          href="#footer-pagamento"
          className="group flex items-center justify-between rounded-xl border border-black/10 bg-white p-3 shadow-sm"
        >
          <div>
            <p className="text-xs text-black/60">Total a pagar</p>
            <p className="text-lg font-semibold">{brl(total)}</p>
          </div>
          <ChevronRight className="h-5 w-5 text-black/60 group-hover:text-black" />
        </Link>
      </div>

      {/* ----------------------- Footer fixo ----------------------- */}
      <div id="footer-pagamento" className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur border-t">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-black/70">Total</span>
            <strong className="text-xl">{brl(total)}</strong>
          </div>
        </div>
        <div className="max-w-md mx-auto px-4 pb-3">
          <div className="grid grid-cols-2 gap-2">
            <Link href="/vendas/produtos" className="text-center rounded-xl px-4 py-3 bg-black text-white">
              Voltar
            </Link>
            <button
              onClick={avancar}
              disabled={!podeAvancar}
              className="text-center rounded-xl px-4 py-3 font-semibold disabled:opacity-50"
              style={{ background: ORANGE, color: '#000' }}
            >
              Avançar
            </button>
          </div>
          {!podeAvancar && (
            <p className="mt-2 text-xs text-[#F15A24]">Selecione o vendedor responsável para continuar.</p>
          )}
        </div>
      </div>
    </div>
  );
}
