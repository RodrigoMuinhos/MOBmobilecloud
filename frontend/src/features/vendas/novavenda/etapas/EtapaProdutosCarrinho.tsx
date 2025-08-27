// src/features/vendas/novavenda/etapas/EtapaProdutosCarrinho.tsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useCarrinho } from '../../../../context/CarrinhoContext';
import api from '../../../../services/api';

// Tipos mínimos locais
type Filial = { id: string; nome: string; uf: string };

interface ProdutoEstoqueAPI {
  id: string;
  codigo: string;
  nome: string;
  marca: string | null;
  tipo: string | null;
  preco_venda_unidade: number | null;
  preco_venda_caixa: number | null;
  unidades_por_caixa: number | null;
  caixas: number | null;
  quantidade_em_estoque?: number | null;
  estoqueId?: string;
  filialId?: string | null;
  // legado opcional
  preco_caixa?: number | null;
}

const EtapaProdutosCarrinho: React.FC = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.vendas;

  const { carrinho, adicionarAoCarrinho, removerDoCarrinho } = useCarrinho();

  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [filialId, setFilialId] = useState<string>('');
  const [estoque, setEstoque] = useState<ProdutoEstoqueAPI[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] =
    useState<'caixa' | '5un' | 'unidade'>('caixa');
  const [filtroMarca, setFiltroMarca] = useState('Todos');
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);

  // ---------- carregar filiais ----------
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/filiais');
        const lista: Filial[] = Array.isArray(data) ? data : [];
        setFiliais(lista);

        // valor inicial
        const fromStorage = localStorage.getItem('filialId') || '';
        if (fromStorage) {
          setFilialId(fromStorage);
        } else if (lista[0]?.id) {
          setFilialId(lista[0].id);
          localStorage.setItem('filialId', lista[0].id);
        }
      } catch (e) {
        console.error('Erro ao carregar filiais:', e);
      }
    })();
  }, []);

  // ---------- carregar estoque por filial ----------
  useEffect(() => {
    const fetchEstoque = async () => {
      if (!filialId) {
        setEstoque([]);
        return;
      }
      setCarregandoEstoque(true);
      try {
        const { data } = await api.get<ProdutoEstoqueAPI[]>('/produtoestoque', {
          params: { filialId },
        });
        setEstoque(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
        setEstoque([]);
      } finally {
        setCarregandoEstoque(false);
      }
    };
    fetchEstoque();
  }, [filialId]);

  // ---------- helpers ----------
  const calcularPrecoDinamico = (produto: ProdutoEstoqueAPI, tipo: string): number => {
    const precoCaixa =
      Number(produto.preco_venda_caixa ?? produto.preco_caixa ?? 0) || 0;
    const unidadesPorCaixa = Number(produto.unidades_por_caixa ?? 1) || 1;

    if (precoCaixa <= 0 || unidadesPorCaixa <= 0) return 0;

    switch (tipo) {
      case 'caixa':
        return precoCaixa;
      case '5un':
        return (precoCaixa / unidadesPorCaixa) * 5;
      case 'unidade':
        return precoCaixa / unidadesPorCaixa;
      default:
        return precoCaixa;
    }
  };

  const adicionarProdutoSelecionado = () => {
    const produto = estoque.find((p) => p.nome === produtoSelecionado);
    if (!produto) return alert('Produto não encontrado.');
    if (!filialId) return alert('Selecione uma filial primeiro.');

    const precoUnitario = calcularPrecoDinamico(produto, tipoSelecionado);
    if (!precoUnitario || isNaN(precoUnitario)) return alert('Preço inválido.');

    const subtotal = +(precoUnitario * 1).toFixed(2);

    adicionarAoCarrinho({
      id: produto.id ?? produto.codigo ?? String(Date.now()),
      codigo: produto.codigo ?? '',
      nome: produto.nome ?? '',
      marca: produto.marca ?? '',
      tipo: tipoSelecionado,
      quantidade: 1,
      precoUnitario,
      subtotal,
      quantidade_em_estoque: Number(produto.quantidade_em_estoque ?? 0),
    });
  };

  // marcas únicas para o filtro
  const marcas = useMemo(() => {
    const set = new Set<string>();
    estoque.forEach((e) => set.add(e.marca || 'Desconhecido'));
    return ['Todos', ...Array.from(set)];
  }, [estoque]);

  // produtos filtrados pela marca
  const produtosFiltrados = useMemo(
    () =>
      estoque.filter(
        (item) => filtroMarca === 'Todos' || item.marca === filtroMarca
      ),
    [estoque, filtroMarca]
  );

  return (
    <div className="space-y-6">
      {/* Seleção de filial */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex flex-col">
          <label className="text-xs opacity-80 mb-1">Filial</label>
          <select
            value={filialId}
            onChange={(e) => {
              const id = e.target.value;
              setFilialId(id);
              localStorage.setItem('filialId', id);
            }}
            className="border p-2 rounded min-w-[220px]"
            style={{
              backgroundColor: temaAtual.input,
              color: temaAtual.texto,
              borderColor: temaAtual.contraste,
            }}
          >
            {filiais.length === 0 && <option value="">Carregando…</option>}
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome} ({f.uf})
              </option>
            ))}
          </select>
        </div>

        {/* Filtro por marca */}
        <div className="flex flex-col">
          <label className="text-xs opacity-80 mb-1">{'Marca'}</label>
          <select
            value={filtroMarca}
            onChange={(e) => setFiltroMarca(e.target.value)}
            className="border p-2 rounded min-w-[160px]"
            style={{
              backgroundColor: temaAtual.input,
              color: temaAtual.texto,
              borderColor: temaAtual.contraste,
            }}
            disabled={!filialId || carregandoEstoque}
          >
            {marcas.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Produto */}
        <div className="flex flex-col">
          <label className="text-xs opacity-80 mb-1">
            {t.selecione || 'Selecione'}
          </label>
          <select
            value={produtoSelecionado}
            onChange={(e) => setProdutoSelecionado(e.target.value)}
            className="border p-2 rounded w-72"
            style={{
              backgroundColor: temaAtual.input,
              color: temaAtual.texto,
              borderColor: temaAtual.contraste,
            }}
            disabled={!filialId || carregandoEstoque}
          >
            <option value="">{t.selecione || 'Selecione'}</option>
            {produtosFiltrados.map((item) => (
              <option key={item.id || item.codigo} value={item.nome}>
                {item.nome}
              </option>
            ))}
          </select>
        </div>

        {/* Tipo de venda */}
        <div className="flex flex-col">
          <label className="text-xs opacity-80 mb-1">{t.tipo || 'Tipo'}</label>
          <select
            value={tipoSelecionado}
            onChange={(e) =>
              setTipoSelecionado(e.target.value as 'caixa' | '5un' | 'unidade')
            }
            className="border p-2 rounded min-w-[140px]"
            style={{
              backgroundColor: temaAtual.input,
              color: temaAtual.texto,
              borderColor: temaAtual.contraste,
            }}
            disabled={!filialId || carregandoEstoque}
          >
            <option value="caixa">{t.caixa || 'Caixa'}</option>
            <option value="5un">{t.cincoUn || '5 Unidades'}</option>
            <option value="unidade">{t.unidade || 'Unidade'}</option>
          </select>
        </div>

        {/* Botão adicionar */}
        <div className="flex flex-col">
          <label className="text-xs opacity-0 mb-1">.</label>
          <button
            onClick={adicionarProdutoSelecionado}
            className="px-4 py-2 rounded font-semibold"
            style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
            disabled={!filialId || !produtoSelecionado || carregandoEstoque}
            title={!filialId ? 'Selecione uma filial' : undefined}
          >
            {"+"}
          </button>
        </div>
      </div>

      {/* Grid/Carrinho */}
      {carrinho.length > 0 ? (
        <>
          <table className="min-w-full text-sm rounded shadow overflow-hidden">
            <thead style={{ backgroundColor: temaAtual.fundoAlt }}>
              <tr>
                <th className="p-2 text-left">{t.produto || 'Produto'}</th>
                <th className="p-2 text-center">{t.tipo || 'Tipo'}</th>
                <th className="p-2 text-center">{t.qtd || 'Qtd'}</th>
                <th className="p-2 text-right">{t.unitario || 'Preço'}</th>
                <th className="p-2 text-right">{t.subtotal || 'Subtotal'}</th>
                <th className="p-2 text-center">{t.acao || 'Ação'}</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.map((item, i) => (
                <tr
                  key={`${item.id}-${i}`}
                  style={{ borderBottom: `1px solid ${temaAtual.contraste}` }}
                >
                  <td className="p-2">
                    <strong>{item.marca}</strong>
                    <br />
                    <span>{item.nome}</span>
                  </td>
                  <td className="p-2 text-center">{item.tipo}</td>
                  <td className="p-2 text-center">{item.quantidade}</td>
                  <td className="p-2 text-right">
                    R$ {item.precoUnitario.toFixed(2)}
                  </td>
                  <td className="p-2 text-right">
                    R$ {(item.precoUnitario * item.quantidade).toFixed(2)}
                  </td>
                  <td className="p-2 text-center">
                    <button
                      onClick={() => removerDoCarrinho(i)}
                      style={{ color: temaAtual.destaque }}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <p className="text-right font-semibold mt-2">
            Total: R$ {carrinho.reduce((soma, p) => soma + p.subtotal, 0).toFixed(2)}
          </p>
        </>
      ) : (
        <p style={{ color: temaAtual.textoClaro }}>
          {carregandoEstoque ? 'Carregando estoque…' : (t.nenhumItem || 'Nenhum item no carrinho.')}
        </p>
      )}
    </div>
  );
};

export default EtapaProdutosCarrinho;
