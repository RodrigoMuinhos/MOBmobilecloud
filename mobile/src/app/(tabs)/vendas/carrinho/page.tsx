'use client';
import { useEffect, useState } from 'react';
import VendaMobileHeader from '@/components/VendaMobileHeader';
import { useVendaMobile } from '@/context/VendaMobileContext';
import { api } from '@/services/api';
import Link from 'next/link';

const useDebounced = <T,>(value: T, delay = 350) => {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
};

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function PagCarrinho() {
  const { carrinho, addItem, rmItem, inc, dec, subtotal } = useVendaMobile();
  const [q, setQ] = useState('');
  const qd = useDebounced(q, 350);
  const [sugs, setSugs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // busca produtos — tenta caminhos alternativos para evitar 404 do seu backend
  useEffect(() => {
    let dead = false;
    const run = async () => {
      if (!qd.trim()) { setSugs([]); return; }
      setLoading(true);
      try {
        const tryPaths = ['/produtos-estoque', '/estoque/produtos', '/produtos'];
        let data: any = [];
        for (const path of tryPaths) {
          try {
            const r = await api.get(path, { params: { busca: qd, limit: 20 } });
            data = r.data;
            if (Array.isArray(data)) break;
          } catch (e: any) {
            if (e?.response?.status !== 404) throw e;
          }
        }
        if (!dead) setSugs(Array.isArray(data) ? data : []);
      } catch {
        if (!dead) setSugs([]);
      } finally {
        if (!dead) setLoading(false);
      }
    };
    run();
    return () => { dead = true; };
  }, [qd]);

  return (
    <main className="min-h-screen bg-[#F5F9F4] flex flex-col">
      <VendaMobileHeader titulo="Nova Venda — Carrinho" />
      <section className="max-w-md mx-auto w-full px-4 py-3 space-y-3">
        <div className="bg-white rounded-2xl border p-3">
          <label className="block text-xs text-gray-500 mb-1">Buscar produto</label>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Nome, código…"
            className="w-full rounded-xl border px-3 py-2 outline-none"
            inputMode="search"
          />
          <div className="relative">
            {loading && <div className="px-3 py-2 text-xs text-gray-500">Buscando…</div>}
            {!loading && !!sugs.length && (
              <ul className="mt-2 rounded-xl border bg-white max-h-72 overflow-auto">
                {sugs.map((p: any) => {
                  const preco = Number(p.preco ?? p.precoUnitario ?? 0) || 0;
                  return (
                    <li
                      key={p.id}
                      className="px-3 py-2 hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                      onClick={() => {
                        addItem({
                          id: p.id,
                          nome: p.nome ?? p.titulo ?? 'Produto',
                          tipoSelecionado: p.tipoPadrao ?? 'Unit',
                          quantidade: 1,
                          precoUnitario: preco,
                        });
                        setQ('');
                        setSugs([]);
                      }}
                    >
                      <span className="text-sm">{p.nome}</span>
                      <span className="text-xs text-gray-500">{brl(preco)}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {carrinho.map((item) => (
          <article key={item.id} className="bg-white rounded-2xl shadow-sm border p-3">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold leading-5">{item.nome}</h3>
                <p className="text-xs text-gray-500">
                  {item.tipoSelecionado ?? 'Unit'} • {brl(item.precoUnitario)}
                </p>
              </div>
              <button onClick={() => rmItem(item.id)} className="text-xs text-red-600 underline">
                remover
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button className="w-9 h-9 rounded-full border grid place-items-center" onClick={() => dec(item.id)}>−</button>
                <span className="w-9 text-center font-semibold">{item.quantidade}</span>
                <button className="w-9 h-9 rounded-full border grid place-items-center" onClick={() => inc(item.id)}>+</button>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Subtotal</p>
                <p className="font-semibold">{brl(item.quantidade * item.precoUnitario)}</p>
              </div>
            </div>
          </article>
        ))}

        <div className="bg-white rounded-2xl border p-3 flex items-center justify-between">
          <p className="text-sm">Subtotal</p>
          <p className="font-semibold">{brl(subtotal)}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link href="/(tabs)/vendas/cliente" className="rounded-2xl py-3 text-center border bg-white">
            Voltar
          </Link>
          <Link
            href="/(tabs)/vendas/finalizar"
            className={`rounded-2xl py-3 text-center font-semibold ${carrinho.length ? 'bg-[#7BAE6A] text-white' : 'bg-gray-200 text-gray-500 pointer-events-none'}`}
          >
            Avançar
          </Link>
        </div>
      </section>
    </main>
  );
}
