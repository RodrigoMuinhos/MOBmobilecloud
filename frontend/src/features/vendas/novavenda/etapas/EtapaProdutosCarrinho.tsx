// EtapaProdutosCarrinho.tsx - Etapa 2 refatorada 100% API

'use client';
import React, { useEffect, useState } from 'react';
import { ProdutoEstoqueAPI } from '../../../../types';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import { useCarrinho } from '../../../../context/CarrinhoContext';
import api from '../../../../services/api';

const EtapaProdutosCarrinho: React.FC = () => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.vendas;
  const { carrinho, adicionarAoCarrinho, removerDoCarrinho } = useCarrinho();

  const [estoque, setEstoque] = useState<ProdutoEstoqueAPI[]>([]);
  const [produtoSelecionado, setProdutoSelecionado] = useState('');
  const [tipoSelecionado, setTipoSelecionado] = useState<'caixa' | '5un' | 'unidade'>('caixa');
  const [filtroMarca, setFiltroMarca] = useState('Todos');

  useEffect(() => {
    const fetchEstoque = async () => {
      try {
        const response = await api.get<ProdutoEstoqueAPI[]>('/produtoestoque');
        setEstoque(response.data);
      } catch (error) {
        console.error('Erro ao buscar estoque:', error);
      }
    };
    fetchEstoque();
  }, []);

  const calcularPrecoDinamico = (produto: ProdutoEstoqueAPI, tipo: string): number => {
    const precoCaixa = produto.preco_venda_caixa ?? 0;
    const unidadesPorCaixa = produto.unidades_por_caixa ?? 1;

    if (precoCaixa === 0 || unidadesPorCaixa === 0) return 0;

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

    const precoUnitario = calcularPrecoDinamico(produto, tipoSelecionado);
    if (!precoUnitario || isNaN(precoUnitario)) return alert('Preço inválido.');

    adicionarAoCarrinho({
      id: produto.id ?? produto.codigo ?? String(Date.now()),
      codigo: produto.codigo ?? '',
      nome: produto.nome ?? '',
      marca: produto.marca ?? '',
      tipo: tipoSelecionado,
      quantidade: 1,
      precoUnitario,
      subtotal: parseFloat((precoUnitario * 1).toFixed(2)),
      quantidade_em_estoque: produto.quantidade_em_estoque ?? 0,
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 items-end">
        <select
          value={filtroMarca}
          onChange={(e) => setFiltroMarca(e.target.value)}
          className="border p-2 rounded"
          style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.contraste }}
        >
          <option value="Todos">Todos</option>
          {Array.from(new Set(estoque.map((item) => item.marca))).map((marca) => (
            <option key={marca} value={marca}>{marca}</option>
          ))}
        </select>

        <select
          value={produtoSelecionado}
          onChange={(e) => setProdutoSelecionado(e.target.value)}
          className="border p-2 rounded w-72"
          style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.contraste }}
        >
          <option value="">{t.selecione || 'Selecione'}</option>
          {estoque
            .filter((item) => filtroMarca === 'Todos' || item.marca === filtroMarca)
            .map((item) => (
              <option key={item.codigo} value={item.nome}>{item.nome}</option>
          ))}
        </select>

        <select
          value={tipoSelecionado}
          onChange={(e) => setTipoSelecionado(e.target.value as 'caixa' | '5un' | 'unidade')}
          className="border p-2 rounded"
          style={{ backgroundColor: temaAtual.input, color: temaAtual.texto, borderColor: temaAtual.contraste }}
        >
          <option value="caixa">{t.caixa || 'Caixa'}</option>
          <option value="5un">{t.cincoUn || '5 Unidades'}</option>
          <option value="unidade">{t.unidade || 'Unidade'}</option>
        </select>

        <button
          onClick={adicionarProdutoSelecionado}
          className="px-4 py-2 rounded font-semibold"
          style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
        >
          {t.adicionarProduto || 'Adicionar'}
        </button>
      </div>

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
                <tr key={i} style={{ borderBottom: `1px solid ${temaAtual.contraste}` }}>
                  <td className="p-2">
                    <strong>{item.marca}</strong><br />
                    <span>{item.nome}</span>
                  </td>
                  <td className="p-2 text-center">{item.tipo}</td>
                  <td className="p-2 text-center">{item.quantidade}</td>
                  <td className="p-2 text-right">R$ {item.precoUnitario.toFixed(2)}</td>
                  <td className="p-2 text-right">R$ {(item.precoUnitario * item.quantidade).toFixed(2)}</td>
                  <td className="p-2 text-center">
                    <button onClick={() => removerDoCarrinho(i)} style={{ color: temaAtual.destaque }}>❌</button>
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
        <p style={{ color: temaAtual.textoClaro }}>{t.nenhumItem || 'Nenhum item no carrinho.'}</p>
      )}
    </div>
  );
};

export default EtapaProdutosCarrinho;
