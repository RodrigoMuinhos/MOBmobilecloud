'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api } from '@/services/api';
import VendaMobileHeader from '@/components/VendaMobileHeader';

const ORANGE = '#F15A24';
const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

type Filial = { id: string; nome?: string | null; cidade?: string | null; uf?: string | null };

const ROTAS = {
  estoques: '/estoques',
  produtoEstoque: '/produtoestoque',
  filiais: '/filiais',
};

export default function EstoquePage() {
  /* --------------------- base: filiais --------------------- */
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setMsg('');
        const { data } = await api.get<Filial[]>(ROTAS.filiais);
        if (!alive) return;
        if (Array.isArray(data) && data.length) {
          setFiliais(data);
          localStorage.setItem('filiais_cache', JSON.stringify(data));
        } else {
          throw new Error('sem filiais');
        }
      } catch {
        const cache = localStorage.getItem('filiais_cache');
        if (cache) setFiliais(JSON.parse(cache));
        else {
          setFiliais([{ id: 'offline-filial', nome: 'Offline', cidade: 'Recife', uf: 'PE' }]);
          setMsg('Sem conexão: usando filial offline.');
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  /* --------------------- formulário (campos iguais ao desktop) --------------------- */
  const [filialId, setFilialId] = useState('');
  const filialSel = useMemo(() => filiais.find(f => f.id === filialId), [filiais, filialId]);

  const [estoqueId, setEstoqueId] = useState(''); // se vazio, criaremos um
  const [marca, setMarca] = useState('');
  const [tipo, setTipo] = useState<'RL' | 'PR' | 'SC' | 'OT'>('RL');

  const [nome, setNome] = useState('');
  const [codigo, setCodigo] = useState('');
  const [precoCompra, setPrecoCompra] = useState<number>(0);

  const [unidadesPorCaixa, setUnidadesPorCaixa] = useState<number>(1);
  const [precoUn, setPrecoUn] = useState<number>(0);
  const [precoCx, setPrecoCx] = useState<number>(0);

  const [caixas, setCaixas] = useState<number>(0);     // 🟠 exatamente como no desktop
  const [unidadesSoltas, setUnidadesSoltas] = useState<number>(0); // opcional; desktop deriva por caixas*unid/caixa

  // ajuda: se informar unid/caixa e preço unitário, sugerimos preço da caixa, e vice-versa
  useEffect(() => {
    if (unidadesPorCaixa > 0 && precoUn > 0 && !precoCx) {
      setPrecoCx(Number((precoUn * unidadesPorCaixa).toFixed(2)));
    }
  }, [unidadesPorCaixa, precoUn]); // eslint-disable-line

  useEffect(() => {
    if (unidadesPorCaixa > 0 && precoCx > 0 && !precoUn) {
      setPrecoUn(Number((precoCx / unidadesPorCaixa).toFixed(2)));
    }
  }, [unidadesPorCaixa, precoCx]); // eslint-disable-line

  const quantidade_em_estoque = useMemo(
    () => Math.max(0, caixas * Math.max(1, unidadesPorCaixa) + Math.max(0, unidadesSoltas)),
    [caixas, unidadesPorCaixa, unidadesSoltas]
  );

  const podeSalvar =
    filialId &&
    (estoqueId || filialSel?.cidade) && // se não houver estoqueId, precisamos da cidade para criar /estoques
    nome.trim().length >= 2 &&
    (precoUn > 0 || precoCx > 0) &&
    unidadesPorCaixa >= 1;

  /* --------------------- ensureEstoqueId (mesma lógica do desktop) --------------------- */
  async function ensureEstoqueId(): Promise<string> {
    const idProp = (estoqueId || '').trim();
    const isIdLogico = !!filialId && idProp === filialId;
    if (idProp && !isIdLogico) return idProp;

    if (!filialId) throw new Error('Selecione uma filial antes de adicionar itens.');
    const cidade = (filialSel?.cidade ?? '').trim();
    if (!cidade) throw new Error('A filial selecionada não possui "cidade" preenchida.');

    const resp = await api.post(ROTAS.estoques, {
      filialId,
      nome: `Estoque ${marca || 'Geral'} - ${tipo || 'Padrão'}`,
      cidade,
    });
    const novoId = resp.data?.id;
    if (!novoId) throw new Error('Não foi possível criar o estoque.');
    setEstoqueId(novoId);
    return novoId;
  }

  /* --------------------- salvar produto no estoque (POST /produtoestoque) --------------------- */
  async function salvar() {
    try {
      const unid = Math.max(1, Number(unidadesPorCaixa) || 1);
      const efetivoEstoqueId = await ensureEstoqueId();

      const payload = {
        // campos idênticos ao desktop:
        nome: nome.trim(),
        codigo: codigo.trim() || null,
        marca: marca.trim() || null,
        tipo,
        preco_compra: Number(precoCompra) || 0,
        preco_venda_unidade: precoUn || (precoCx && unid ? +(precoCx / unid).toFixed(2) : 0),
        preco_venda_caixa:  precoCx || (precoUn && unid ? +(precoUn * unid).toFixed(2) : 0),
        caixas: Math.max(0, Number(caixas) || 0),                     // 🟠 campo “caixas”
        quantidade_em_estoque: quantidade_em_estoque,                 // 🟠 total de unidades
        unidades_por_caixa: unid,
        estoqueId: efetivoEstoqueId,
        filialId,
      };

      await api.post(ROTAS.produtoEstoque, payload);
      alert('Estoque salvo com sucesso!');

      // reset leve
      setNome(''); setCodigo(''); setPrecoCompra(0);
      setPrecoUn(0); setPrecoCx(0);
      setCaixas(0); setUnidadesSoltas(0);
    } catch (err: any) {
      console.error('Erro ao criar item:', err?.response?.data || err);
      alert(err?.response?.data?.erro ?? err?.message ?? 'Erro ao adicionar item.');
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[#F5F9F4] pb-28">
      <VendaMobileHeader titulo="Estoque — Inserir" rightLink={{ href: '/home', label: 'Início' }} />

      <div className="max-w-md mx-auto p-4 space-y-4">
        {loading && <div className="text-sm text-black/60">Carregando filiais…</div>}
        {!!msg && <div className="text-sm text-[#F15A24]">{msg}</div>}

        {/* Filial + (opcional) Estoque existente */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <label className="block text-sm text-black/70 mb-1">Filial *</label>
          <select
            value={filialId}
            onChange={(e) => setFilialId(e.target.value)}
            className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
          >
            <option value="">Selecione…</option>
            {filiais.map(f => (
              <option key={f.id} value={f.id}>
                {f.nome || [f.cidade, f.uf].filter(Boolean).join(' - ') || f.id}
              </option>
            ))}
          </select>

          <label className="block text-sm text-black/70">
            <span className="block mb-1">Estoque (opcional)</span>
            <input
              value={estoqueId}
              onChange={(e) => setEstoqueId(e.target.value)}
              placeholder="Se vazio, criaremos um automaticamente"
              className="w-full rounded-xl border border-black/20 bg-white px-3 py-2"
            />
          </label>
        </div>

        {/* Dados do produto */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Marca</span>
              <input value={marca} onChange={(e) => setMarca(e.target.value)}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
            </label>
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Código</span>
              <input value={codigo} onChange={(e) => setCodigo(e.target.value)}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
            </label>
          </div>

          <label className="block text-sm">
            <span className="block text-black/70 mb-1">Nome do produto *</span>
            <input value={nome} onChange={(e) => setNome(e.target.value)}
                   className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
          </label>

          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm col-span-2">
              <span className="block text-black/70 mb-1">Tipo</span>
              <select value={tipo} onChange={(e) => setTipo(e.target.value as any)}
                      className="w-full rounded-xl border border-black/20 bg-white px-3 py-2">
                <option value="RL">Regular</option>
                <option value="PR">Premium</option>
                <option value="SC">Scalp</option>
                <option value="OT">Outro</option>
              </select>
            </label>
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Unid./Caixa</span>
              <input type="number" min={1} value={unidadesPorCaixa}
                     onChange={(e) => setUnidadesPorCaixa(Math.max(1, Number(e.target.value) || 1))}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
            </label>
          </div>
        </div>

        {/* Preços */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Preço unidade</span>
              <input type="number" step="0.01" value={precoUn}
                     onChange={(e) => setPrecoUn(Math.max(0, Number(e.target.value) || 0))}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
              <p className="text-xs text-black/50 mt-1">{brl(precoUn || 0)}</p>
            </label>
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Preço caixa</span>
              <input type="number" step="0.01" value={precoCx}
                     onChange={(e) => setPrecoCx(Math.max(0, Number(e.target.value) || 0))}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
              <p className="text-xs text-black/50 mt-1">{brl(precoCx || 0)}</p>
            </label>
          </div>

          <label className="block text-sm">
            <span className="block text-black/70 mb-1">Preço de compra</span>
            <input type="number" step="0.01" value={precoCompra}
                   onChange={(e) => setPrecoCompra(Math.max(0, Number(e.target.value) || 0))}
                   className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
          </label>
        </div>

        {/* Quantidades */}
        <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">
              <span className="block text-black/70 mb-1">Caixas</span>
              <input type="number" min={0} value={caixas}
                     onChange={(e) => setCaixas(Math.max(0, Number(e.target.value) || 0))}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
            </label>
            <label className="block text-sm col-span-2">
              <span className="block text-black/70 mb-1">Unidades soltas</span>
              <input type="number" min={0} value={unidadesSoltas}
                     onChange={(e) => setUnidadesSoltas(Math.max(0, Number(e.target.value) || 0))}
                     className="w-full rounded-xl border border-black/20 bg-white px-3 py-2" />
            </label>
          </div>
          <div className="rounded-xl border border-black/10 bg-black/[0.03] p-3 text-sm">
            Total (quantidade_em_estoque): <strong>{quantidade_em_estoque}</strong> un.
          </div>
        </div>

        <button
          onClick={salvar}
          disabled={!podeSalvar}
          className="w-full rounded-2xl py-3 font-semibold disabled:opacity-50"
          style={{ background: ORANGE, color: '#000' }}
        >
          Salvar item
        </button>

        <Link href="/home" className="block text-center text-sm underline text-black/70">
          Voltar para a Home
        </Link>
      </div>
    </div>
  );
}
