'use client';
import { useMemo, useState } from 'react';
import { useCatalogo } from '@/context/CatalogoSimples';

type Props = {
  onAdd: (item: {
    id: string;
    nome: string;
    tipoSelecionado: string; // 'UN' | 'CX' | '5un' etc.
    quantidade: number;
    precoUnitario: number;
  }) => void;
};

const brl = (v: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

export default function SeletorProdutoCarrinho({ onAdd }: Props) {
  const { filiais, produtos, marcas, loading } = useCatalogo();

  const [filialId, setFilialId] = useState<string>('');
  const [marca, setMarca] = useState<string>('');
  const [produtoId, setProdutoId] = useState<string>('');
  const [tipo, setTipo] = useState<'UN' | 'CX' | '5un'>('UN');
  const [qtd, setQtd] = useState<number>(1);

  const produtosFiltrados = useMemo(
    () => produtos.filter((p) => (!filialId || p.filialId === filialId) && (!marca || (p.marca ?? '') === marca)),
    [produtos, filialId, marca]
  );

  const produto = useMemo(() => produtosFiltrados.find((p) => p.id === produtoId), [produtoId, produtosFiltrados]);

  const unidadesPorCaixa = produto?.unidades_por_caixa && produto.unidades_por_caixa > 0 ? produto.unidades_por_caixa : 1;
  const precoUn = (produto?.preco_venda_unidade ?? 0) || ((produto?.preco_venda_caixa ?? 0) / Math.max(1, unidadesPorCaixa));
  const precoCx = produto?.preco_venda_caixa ?? (precoUn * Math.max(1, unidadesPorCaixa));
  const preco5 = precoUn * 5;

  const precoMostrar =
    tipo === 'UN' ? precoUn :
    tipo === '5un' ? preco5 :
    precoCx;

  const habilitarAdd = !!produto && qtd > 0;

  const add = () => {
    if (!produto) return;
    const precoUnitario =
      tipo === 'UN' ? precoUn :
      tipo === '5un' ? preco5 / 5 :
      precoCx / Math.max(1, unidadesPorCaixa);

    onAdd({
      id: produto.id,
      nome: produto.nome,
      tipoSelecionado: tipo,
      quantidade: qtd,
      precoUnitario,
    });
    setQtd(1);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-sm">Filial</label>
        <select className="w-full border rounded px-3 py-2"
          value={filialId} onChange={(e) => setFilialId(e.target.value)}>
          <option value="">Todas</option>
          {filiais.map(f => (
            <option key={f.id} value={f.id}>
              {f.nome || [f.cidade, f.uf].filter(Boolean).join(' - ') || f.id}
            </option>
          ))}
        </select>
        {loading && <div className="text-xs opacity-60 mt-1">Carregando…</div>}
      </div>

      <div>
        <label className="text-sm">Marca</label>
        <select className="w-full border rounded px-3 py-2"
          value={marca} onChange={(e) => { setMarca(e.target.value); setProdutoId(''); }}>
          <option value="">Todas</option>
          {marcas.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="text-sm">Produto</label>
        <select className="w-full border rounded px-3 py-2"
          value={produtoId} onChange={(e) => setProdutoId(e.target.value)}>
          <option value="">Selecione um produto</option>
          {produtosFiltrados.map(p => (
            <option key={p.id} value={p.id}>
              {p.nome} {p.marca ? `(${p.marca})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="flex gap-2 items-center">
        <label className="text-sm">Tipo</label>
        <select className="border rounded px-3 py-2" value={tipo} onChange={(e) => setTipo(e.target.value as any)}>
          <option value="UN">Unidade</option>
          <option value="5un">5 Unidades</option>
          <option value="CX">Caixa</option>
        </select>

        <label className="text-sm ml-4">Qtd</label>
        <input type="number" min={1} className="w-20 border rounded px-2 py-2 text-right"
          value={qtd} onChange={(e) => setQtd(Math.max(1, Number(e.target.value) || 1))} />

        <div className="ml-auto text-sm">
          Preço: <strong>{brl(precoMostrar)}</strong>
        </div>
      </div>

      <button
        disabled={!habilitarAdd}
        onClick={add}
        className="w-full rounded px-4 py-3 text-white disabled:opacity-50"
        style={{ background: '#F15A24' }}
      >
        Adicionar
      </button>
    </div>
  );
}
