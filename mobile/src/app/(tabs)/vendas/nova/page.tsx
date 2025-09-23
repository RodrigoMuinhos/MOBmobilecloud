'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { listarVendas, type Venda } from '@/lib/vendas';
import { BRL } from '@/lib/format';

export default function VendasPage() {
  const [data, setData] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const vendas = await listarVendas({ limit: 50 });
        setData(vendas);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <section className="p-4 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Vendas</h1>
        <Link href="/(tabs)/vendas/nova" className="bg-black text-white px-4 py-2 rounded-lg">Nova</Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Carregando…</div>
      ) : (
        <ul className="space-y-2">
          {data.map((v) => (
            <li key={v.id}>
              <Link href={`/(tabs)/vendas/${v.id}`} className="block rounded-xl bg-white border shadow-sm p-3">
                <div className="flex items-center justify-between">
                  <div className="font-medium">{v.clienteNome ?? 'Cliente'}</div>
                  <div className="font-semibold">{BRL(v.totalFinal)}</div>
                </div>
                <div className="text-gray-500 text-sm">
                  {new Date(v.dataVenda).toLocaleString('pt-BR')} · {v.status_pagamento}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
