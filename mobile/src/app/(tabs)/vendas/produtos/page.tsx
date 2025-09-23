'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import VendaMobileHeader from '@/components/VendaMobileHeader';
import { useVendaMobile } from '@/context/VendaMobileContext';
import { listarFiliais, listarProdutosPorFilial, ProdutoCatalogo } from '@/services/catalogo';
import { Search, Minus, Plus, Trash2 } from 'lucide-react';

const ORANGE = '#F15A24';
const HOME_HREF = '/home'; // ⇠ ajuste para a sua home autenticada (ex.: '/' ou '/dashboard')

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function useDebounced<T>(v: T, d = 300) {
  const [x, setX] = useState(v);
  useEffect(() => {
    const t = setTimeout(() => setX(v), d);
    return () => clearTimeout(t);
  }, [v, d]);
  return x;
}

export default function ProdutosEtapa() {
  const { addItem, inc, dec, rmItem, carrinho, subtotal, setFilialId } = useVendaMobile();

  const [filiais, setFiliais] = useState<{ id: string; nome: string }[]>([]);
  const [filialId, setFilial] = useState('');
  const [produtos, setProdutos] = useState<ProdutoCatalogo[]>([]);
  const [marca, setMarca] = useState('');
  const [q, setQ] = useState('');
  const qd = useDebounced(q, 300);

  const [produtoSel, setProdutoSel] = useState('');
  const [tipoSel, setTipoSel] = useState<'caixa' | '5un' | 'unidade' | ''>('');
  const [qtyStr, setQtyStr] = useState('1');

  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  /* ------------------------- carga de filiais ------------------------- */
  useEffect(() => {
    (async () => {
      try {
        const fs = await listarFiliais();
        setFiliais(fs);
        const initial = localStorage.getItem('filialId') || fs[0]?.id || '';
        setFilial(initial);
        setFilialId(initial);
      } catch {
        setMsg('Falha ao carregar filiais');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- carga de produtos ------------------------ */
  useEffect(() => {
    if (!filialId) {
      setProdutos([]);
      return;
    }
    (async () => {
      try {
        setBusy(true);
        setMsg('');
        const ps = await listarProdutosPorFilial(filialId);
        setProdutos(ps);
        localStorage.setItem('filialId', filialId);
      } catch {
        setMsg('Erro ao buscar produtos');
      } finally {
        setBusy(false);
      }
    })();
  }, [filialId]);

  /* ---------------------------- derivadas ---------------------------- */
  const marcas = useMemo(() => {
    const set = new Set<string>();
    produtos.forEach((p) => p.marca && set.add(p.marca));
    return Array.from(set);
  }, [produtos]);

  const filtrados = useMemo(() => {
    const qn = qd.trim().toLowerCase();
    return produtos.filter((p) => {
      const okMarca = !marca || p.marca === marca;
      const okQ =
        !qn ||
        p.nome?.toLowerCase().includes(qn) ||
        p.codigo?.toLowerCase().includes(qn);
      return okMarca && okQ;
    });
  }, [produtos, marca, qd]);

  const atual = useMemo(
    () => filtrados.find((p) => p.id === produtoSel),
    [filtrados, produtoSel]
  );
  const tipos = atual?.tipos ?? [];
  const preco = tipos.find((t) => t.key === tipoSel)?.preco ?? 0;

  /* ---------------------------- ações ---------------------------- */
  function addToCart() {
    if (!atual || !tipoSel) return;
    const qNum = Math.max(0, Number(qtyStr || '0'));
    if (qNum === 0) return;
    addItem({
      id: atual.id,
      nome: `${atual.nome}${atual.codigo ? ` (${atual.codigo})` : ''}`,
      tipoSelecionado: tipoSel,
      quantidade: qNum,
      precoUnitario: preco,
    });
    setProdutoSel('');
    setTipoSel('');
    setQtyStr('1');
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F9F4] pb-28">
      <VendaMobileHeader titulo="Selecionar produtos" rightLink={{ href: HOME_HREF, label: 'Início' }} />

      <div className="p-4 space-y-4 max-w-md mx-auto">
        {/* --------- Filtros --------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          {/* Filial */}
          <label className="block text-sm">
            <span className="block text-black/70 mb-1">Filial</span>
            <select
              value={filialId}
              onChange={(e) => {
                setFilial(e.target.value);
                setFilialId(e.target.value);
              }}
              className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            >
              {filiais.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome}
                </option>
              ))}
            </select>
          </label>

          {/* Marcas (chips roláveis) */}
          <div className="mt-3">
            <p className="text-sm text-black/70 mb-1">Marca</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setMarca('')}
                className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
                  !marca
                    ? 'border-black bg-black text-white'
                    : 'border-black/20 bg-white text-black'
                }`}
              >
                Todas
              </button>
              {marcas.map((m) => (
                <button
                  key={m}
                  onClick={() => setMarca(m)}
                  className={`px-3 py-1.5 rounded-full border text-sm whitespace-nowrap ${
                    marca === m
                      ? 'border-black bg-black text-white'
                      : 'border-black/20 bg-white text-black'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Busca */}
          <div className="mt-3 relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nome ou código"
              className="w-full rounded-xl border border-black/20 bg-white px-3 py-2 pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/60" />
          </div>

          {msg && <p className="mt-2 text-sm text-[#F15A24]">{msg}</p>}
          {busy && <p className="mt-2 text-sm text-black/60">Carregando…</p>}
        </div>

        {/* --------- Adicionar item --------- */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <label className="block text-sm">
            <span className="block text-black/70 mb-1">Produto</span>
            <select
              value={produtoSel}
              onChange={(e) => {
                setProdutoSel(e.target.value);
                setTipoSel('');
              }}
              className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            >
              <option value="">Selecione um produto</option>
              {filtrados.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.marca ? `${p.marca} · ` : ''}{p.nome}{p.codigo ? ` (${p.codigo})` : ''}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-5 gap-2">
            <select
              value={tipoSel}
              onChange={(e) => setTipoSel(e.target.value as any)}
              className="col-span-3 rounded-xl border border-black/20 bg-white px-3 py-2"
              disabled={!produtoSel}
            >
              <option value="">Tipo</option>
              {atual?.tipos?.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label} — {brl(t.preco)}
                </option>
              ))}
            </select>

            <div className="col-span-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setQtyStr(String(Math.max(0, (parseInt(qtyStr || '0') || 0) - 1)))}
                disabled={!tipoSel}
                className="grid place-items-center h-10 w-10 rounded-lg border border-black/20 bg-white disabled:opacity-50"
                aria-label="Diminuir"
              >
                <Minus className="h-4 w-4" />
              </button>

              <input
                inputMode="numeric"
                pattern="[0-9]*"
                value={qtyStr}
                onChange={(e) => setQtyStr(e.target.value.replace(/[^\d]/g, ''))}
                onBlur={() => qtyStr === '' && setQtyStr('0')}
                className="w-full text-center rounded-lg border border-black/20 bg-white py-2"
                disabled={!tipoSel}
              />

              <button
                type="button"
                onClick={() => setQtyStr(String((parseInt(qtyStr || '0') || 0) + 1))}
                disabled={!tipoSel}
                className="grid place-items-center h-10 w-10 rounded-lg border border-black/20 bg-white disabled:opacity-50"
                aria-label="Aumentar"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <button
            onClick={addToCart}
            disabled={!tipoSel || Number(qtyStr || '0') <= 0}
            className="w-full rounded-xl py-3 font-semibold disabled:opacity-50"
            style={{ background: ORANGE, color: '#000' }}
          >
            Adicionar
          </button>
        </div>

        {/* --------- Carrinho --------- */}
        <div className="space-y-2">
          {carrinho.length === 0 ? (
            <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-black/60">
              Nenhum item no carrinho.
            </div>
          ) : (
            carrinho.map((it, i) => (
              <div key={`${it.id}-${i}`} className="rounded-xl border border-black/10 bg-white p-3 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-black truncate">{it.nome}</p>
                    <p className="text-xs text-black/60">
                      {it.tipoSelecionado ?? 'Unit'} · {brl(it.precoUnitario)}
                    </p>
                  </div>
                  <button
                    className="text-black/60 hover:text-black"
                    onClick={() => rmItem(it.id)}
                    aria-label="Remover"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>

                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dec(it.id)}
                      className="grid place-items-center h-9 w-9 rounded-lg border border-black/20 bg-white"
                      aria-label="Diminuir"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center font-medium">{it.quantidade}</span>
                    <button
                      onClick={() => inc(it.id)}
                      className="grid place-items-center h-9 w-9 rounded-lg border border-black/20 bg-white"
                      aria-label="Aumentar"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-right font-semibold">
                    {brl(it.precoUnitario * it.quantidade)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* --------- Footer fixo (total + ações) --------- */}
      <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/95 backdrop-blur border-t">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-black/70">Total</span>
            <strong className="text-xl">{brl(subtotal)}</strong>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/vendas/cliente" className="text-center rounded-xl px-4 py-3 bg-black text-white">
              Voltar
            </Link>
            <Link
              href="/vendas/pagamento"
              className="text-center rounded-xl px-4 py-3 font-semibold"
              style={{ background: ORANGE, color: '#000' }}
            >
              Avançar
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
