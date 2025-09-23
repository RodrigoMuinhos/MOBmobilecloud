'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import VendaMobileHeader from '@/components/VendaMobileHeader';
import { useVendaMobile } from '@/context/VendaMobileContext';
import { finalizarVenda } from '@/services/vendas';
import { getDraft, clearDraft, type CheckoutDraft } from '@/lib/checkoutDraft';
import { gerarReciboPDF } from '@/lib/recibo';

const brl = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function toNumberSafe(s: string): number {
  if (!s) return 0;
  const n = Number(s.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

// acréscimo (%) por quantidade de parcelas
const TAXA_CREDITO: Record<number, number> = {
  1: 0, 2: 2.5, 3: 3.9, 4: 4.9, 5: 5.9, 6: 6.9,
  7: 7.9, 8: 8.9, 9: 9.9, 10: 10.9, 11: 11.9, 12: 12.9,
};

// ajuste a rota de relatórios se precisar
const RELATORIOS_PATH = '/relatorios';

/* --------- Modal simples de sucesso --------- */
function SuccessModal({ open, title, subtitle }: { open: boolean; title: string; subtitle?: string }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center">
          <span className="text-2xl">✅</span>
        </div>
        <div className="text-lg font-semibold">{title}</div>
        {subtitle && <div className="mt-1 text-sm text-gray-600">{subtitle}</div>}
      </div>
    </div>
  );
}

export default function RevisaoPage() {
  const router = useRouter();
  const { carrinho, subtotal, filialId } = useVendaMobile();

  /* ---------------- cliente (somente exibição) ---------------- */
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [clienteNome, setClienteNome] = useState('-');
  const [clienteCpf, setClienteCpf] = useState('');

  useEffect(() => {
    try {
      const raw = localStorage.getItem('ms_cliente');
      if (raw) {
        const c = JSON.parse(raw);
        setClienteId(c.id || c._id || c.clienteId || null);
        setClienteNome(c.nome || c.name || [c.firstName, c.lastName].filter(Boolean).join(' ') || '-');
        setClienteCpf(c.cpf || c.cpfCnpj || c.documento || c.doc || '');
      } else {
        const cid = localStorage.getItem('clienteId');
        const cnome = localStorage.getItem('clienteNome');
        const ccpf =
          localStorage.getItem('clienteCpf') ||
          localStorage.getItem('cpf') ||
          localStorage.getItem('documento') ||
          localStorage.getItem('cpfCnpj');
        if (cid) setClienteId(cid);
        if (cnome) setClienteNome(cnome || '-');
        if (ccpf) setClienteCpf(ccpf || '');
      }
    } catch {}
  }, []);

  /* ------- fallback de filial para habilitar o botão ------- */
  const [filialFallback, setFilialFallback] = useState<string | null>(null);
  useEffect(() => { try { setFilialFallback(localStorage.getItem('filialId')); } catch {} }, []);
  const filialEfetiva = useMemo(() => (filialId || filialFallback || null), [filialId, filialFallback]);

  /* -------------- rascunho -------------- */
  const [d, setD] = useState<CheckoutDraft>({
    descontoStr: '0', freteStr: '0', destinoDesc: 'CLIENTE', pgto: 'PIX', parcelas: 1, obs: ''
  });
  useEffect(() => { setD(getDraft()); }, []);

  /* -------------- totais -------------- */
  const desconto = toNumberSafe(d.descontoStr);
  const frete = toNumberSafe(d.freteStr);
  const baseAntesCredito = Math.max(0, subtotal - desconto + frete);
  const acrescimoCredito = d.pgto === 'CREDITO'
    ? baseAntesCredito * ((TAXA_CREDITO[d.parcelas ?? 1] ?? 0) / 100)
    : 0;
  const totalFinal = baseAntesCredito + acrescimoCredito;

  /* -------------- estados de ação -------------- */
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [showOk, setShowOk] = useState(false);
  const [okText, setOkText] = useState<{ title: string; subtitle?: string }>({ title: '', subtitle: '' });

  // Exigimos itens + filial + cliente para evitar 500 no backend
  const podeFinalizar = carrinho.length > 0 && !!clienteId && !!filialEfetiva && !salvando;

  async function compartilharOuBaixarPDF(vendaId: string, blob: Blob) {
    const fileName = `Recibo-${vendaId}.pdf`;
    const file = new File([blob], fileName, { type: 'application/pdf' });
    const n: any = typeof navigator !== 'undefined' ? navigator : null;

    try {
      if (n?.share && n?.canShare?.({ files: [file] })) {
        await n.share({ title: 'Recibo de venda', text: 'Segue seu recibo.', files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = fileName; a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1500);
        const msg = `Venda ${vendaId} finalizada. Recibo baixado.`;
        if (typeof window !== 'undefined') window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, '_blank');
      }
    } catch {}
  }

  async function gerarReciboPreview() {
    const blob = await gerarReciboPDF({
      vendaId: 'PREVIEW',
      data: new Date().toLocaleString('pt-BR'),
      cliente: { nome: clienteNome || '-', cpf: clienteCpf || undefined },
      filial: null,
      forma_pagamento: d.pgto,
      parcelas: d.pgto === 'CREDITO' ? (d.parcelas ?? 1) : null,
      itens: carrinho.map(i => ({
        nome: i.nome, tipo: i.tipoSelecionado ?? null, quantidade: i.quantidade, precoUnitario: i.precoUnitario
      })),
      subtotal, desconto, frete, acrescimoCredito, total: totalFinal, observacoes: d.obs || null,
    });
    await compartilharOuBaixarPDF('PREVIEW', blob);
  }

  async function finalizar() {
    if (!podeFinalizar) return;
    setErro(null);
    setSalvando(true);
    try {
      if (!clienteId) { setErro('Selecione um cliente para finalizar.'); setSalvando(false); return; }

      const { id: vendaId } = await finalizarVenda({
        clienteId,
        filialId: filialEfetiva as string,
        carrinhoUI: carrinho,
        subtotal,
        descontoValor: desconto,
        destinoDesconto: d.destinoDesc,
        frete,
        forma_pagamento: d.pgto,
        // IMPORTANTE: não envie null quando não for crédito
        parcelas: d.pgto === 'CREDITO' ? (d.parcelas ?? 1) : undefined,
        acrescimoCredito: d.pgto === 'CREDITO' ? +acrescimoCredito : undefined,
        totalFinal: +totalFinal,
        observacoes: d.obs || undefined,
      });

      // Modal de sucesso
      setOkText({ title: 'Venda concluída!', subtitle: `#${vendaId}` });
      setShowOk(true);

      // Recibo
      const blob = await gerarReciboPDF({
        vendaId,
        data: new Date().toLocaleString('pt-BR'),
        cliente: { nome: clienteNome || '-', cpf: clienteCpf || undefined },
        filial: null,
        forma_pagamento: d.pgto,
        parcelas: d.pgto === 'CREDITO' ? (d.parcelas ?? 1) : null,
        itens: carrinho.map(i => ({
          nome: i.nome, tipo: i.tipoSelecionado ?? null, quantidade: i.quantidade, precoUnitario: i.precoUnitario
        })),
        subtotal, desconto, frete, acrescimoCredito, total: totalFinal, observacoes: d.obs || null,
      });
      await compartilharOuBaixarPDF(vendaId, blob);

      // Limpeza + ir para Relatórios
      clearDraft();
      try { sessionStorage.removeItem('ms_cart'); } catch {}
      setTimeout(() => router.replace(RELATORIOS_PATH), 1200);
    } catch (e: any) {
      // Mostra mensagem real do backend se houver
      const msg = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Falha ao finalizar venda';
      console.error('[finalizarVenda] erro', {
        status: e?.response?.status,
        url: e?.config?.baseURL + e?.config?.url,
        payload: e?.config?.data,
        response: e?.response?.data,
      });
      setErro(msg);
      setShowOk(false);
    } finally {
      setSalvando(false);
    }
  }

  const brlSubtotal = useMemo(() => brl(subtotal), [subtotal]);

  return (
    <div className="min-h-screen bg-[#F5F9F4]">
      <VendaMobileHeader titulo="Nova Venda — Revisão" />

      {/* Modal de sucesso */}
      <SuccessModal open={showOk} title={okText.title} subtitle={okText.subtitle} />

      <div className="p-4 space-y-4">
        {/* Recibo na tela */}
        <div className="rounded-2xl overflow-hidden bg-white shadow">
          <div className="px-4 py-3 border-b">
            <div className="text-lg font-semibold">Recibo (pré-visualização)</div>
            <div className="text-xs text-gray-600">Confira os dados antes de finalizar</div>
          </div>

          <div className="p-4 space-y-3">
            <div>
              <div className="text-xs text-gray-600">Cliente</div>
              <div className="font-medium">{clienteNome || '-'}</div>
              {clienteCpf && <div className="text-xs text-gray-600">CPF: {clienteCpf}</div>}
            </div>

            <div className="rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 text-gray-600">
                  <tr>
                    <th className="text-left p-2">Produto</th>
                    <th className="text-left p-2">Tipo</th>
                    <th className="text-right p-2">Qtd</th>
                    <th className="text-right p-2">Preço</th>
                    <th className="text-right p-2">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {carrinho.map((it, i) => (
                    <tr key={i} className="border-t">
                      <td className="p-2">{it.nome}</td>
                      <td className="p-2">{it.tipoSelecionado ?? '-'}</td>
                      <td className="p-2 text-right">{it.quantidade}</td>
                      <td className="p-2 text-right">{brl(it.precoUnitario)}</td>
                      <td className="p-2 text-right">{brl(it.precoUnitario * it.quantidade)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="rounded-xl bg-white border p-3">
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Subtotal</span><span>{brlSubtotal}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Desconto ({d.destinoDesc})</span><span>- {brl(desconto)}</span></div>
              <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Frete</span><span>+ {brl(frete)}</span></div>
              {d.pgto === 'CREDITO' && (
                <div className="flex items-center justify-between"><span className="text-xs text-gray-600">Acréscimo (crédito)</span><span>+ {brl(acrescimoCredito)}</span></div>
              )}
              <div className="mt-2 border-t pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-600">Total</span>
                <span className="text-xl font-semibold">{brl(totalFinal)}</span>
              </div>

              <div className="text-xs text-gray-600 mt-2">
                Forma de pagamento: <strong>{d.pgto}</strong>
                {d.pgto === 'CREDITO' && <> — <strong>{d.parcelas ?? 1}x</strong></>}
              </div>

              {d.obs && <div className="text-xs text-gray-600 mt-1">Obs.: {d.obs}</div>}
            </div>
          </div>
        </div>

        {erro && <p className="text-sm text-red-600">{erro}</p>}

        {/* Ações */}
        <div className="flex gap-2">
          <Link href="/vendas/pagamento" className="flex-1 text-center rounded-xl px-4 py-3 bg-gray-800 text-white">
            Voltar
          </Link>

          <button
            type="button"
            onClick={gerarReciboPreview}
            className="rounded-xl px-4 py-3 bg-white border text-gray-800"
          >
            Gerar recibo
          </button>

          <button
            onClick={finalizar}
            disabled={!podeFinalizar}
            className="flex-1 rounded-xl px-4 py-3 bg-emerald-600 text-white disabled:opacity-50"
          >
            {salvando ? 'Salvando…' : 'Finalizar venda'}
          </button>
        </div>

        {!podeFinalizar && (
          <p className="text-xs text-gray-500">
            Verifique se há itens no carrinho, <em>cliente</em> selecionado e <em>filial</em> definida.
          </p>
        )}
      </div>
    </div>
  );
}
