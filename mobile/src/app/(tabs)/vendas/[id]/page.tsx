'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { alterarStatusPagamento, obterVenda, type Venda } from '@/lib/vendas';
import { BRL } from '@/lib/format';

export default function VendaDetalhePage() {
  const params = useParams<{ id: string }>();
  const [venda, setVenda] = useState<Venda | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const v = await obterVenda(String(params.id));
        setVenda(v);
      } finally {
        setLoading(false);
      }
    })();
  }, [params.id]);

  if (loading) return <section className="p-4">Carregando…</section>;
  if (!venda) return <section className="p-4">Venda não encontrada</section>;

  return (
    <section className="p-4 max-w-3xl mx-auto space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Detalhe da venda</h1>
        <Link href="/(tabs)/vendas" className="text-gray-500">Voltar</Link>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="font-semibold">{venda.clienteNome ?? 'Cliente'}</div>
        <div className="text-gray-500 text-sm">{new Date(venda.dataVenda).toLocaleString('pt-BR')}</div>
        <div className="text-gray-500 text-sm">Status: {venda.status_pagamento}</div>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm space-y-2">
        <div className="font-semibold">Itens</div>
        {venda.carrinho.map((it, idx) => (
          <div key={idx} className="flex items-center justify-between py-1">
            <div>{it.nome} · {it.tipoSelecionado} × {it.quantidade}</div>
            <div>{BRL(it.subtotal ?? (it.quantidade * it.precoUnitario))}</div>
          </div>
        ))}
        <div className="h-px bg-gray-200 my-2" />
        <div className="flex items-center justify-between"><span>Subtotal</span><strong>{BRL(venda.subtotal)}</strong></div>
        <div className="flex items-center justify-between"><span>Desconto</span><strong>- {BRL(venda.descontoValor)}</strong></div>
        <div className="flex items-center justify-between"><span>Frete</span><strong>{BRL(venda.frete)}</strong></div>
        <div className="flex items-center justify-between"><span>Total</span><strong>{BRL(venda.totalFinal)}</strong></div>
      </div>

      <div className="bg-white p-4 rounded-2xl border shadow-sm">
        <div className="font-semibold mb-2">Ações</div>
        <div className="flex gap-3">
          <button onClick={async () => setVenda(await alterarStatusPagamento(venda.id, 'PAGO'))} className="bg-black text-white px-4 py-2 rounded-lg">Marcar PAGO</button>
          <button onClick={async () => setVenda(await alterarStatusPagamento(venda.id, 'PENDENTE'))} className="bg-white border px-4 py-2 rounded-lg">Pendente</button>
          <button onClick={async () => setVenda(await alterarStatusPagamento(venda.id, 'CANCELADO'))} className="bg-red-600 text-white px-4 py-2 rounded-lg">Cancelar</button>
        </div>
      </div>
    </section>
  );
}
