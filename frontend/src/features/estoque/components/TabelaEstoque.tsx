// src/features/estoque/components/TabelaEstoque.tsx
'use client';
import React, { useMemo, useState } from 'react';
import { ProdutoEstoqueAPI } from '../../../types';
import api from '../../../services/api';
import LinhaTabelaEstoque from './LinhaTabelaEstoque';
import HeaderTabelaEstoque from './HeaderTabelaEstoque';

interface Props {
  categoria: string;
  tipo: string;
  itens: ProdutoEstoqueAPI[];
  temaAtual: any;
  carregarEstoque: () => void;
  filialId: string;
  estoqueId: string;          // do grupo (ou ativo na página)
  filialCidade?: string;      // cidade da filial para criação de estoque
}

function gerarCodigoAuto(marca: string): string {
  const prefixo = marca.toUpperCase().startsWith('SK')
    ? 'SKN'
    : marca.toUpperCase().slice(0, 3).padEnd(3, 'X');
  const numero = Math.floor(100 + Math.random() * 900);
  return `${prefixo}${numero}`;
}

const TabelaEstoque: React.FC<Props> = ({
  categoria, tipo, itens = [], temaAtual, carregarEstoque, filialId, estoqueId, filialCidade,
}) => {
  const [abrirDraft, setAbrirDraft] = useState(false);

  const isCategoriaVazia = (id?: string) => !id || id.startsWith('vazio-');

  // Aceita "43,90", remove pontos de milhar, preserva números já numéricos
  const toNumber = (v: any) => {
    if (v === '' || v == null) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const s = String(v).trim();
    if (s.includes(',')) {
      const n = Number(s.replace(/\./g, '').replace(',', '.'));
      return Number.isFinite(n) ? n : 0;
    }
    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  // estoqueId efetivo (prop ou deduzido dos itens)
  const effectiveEstoqueId =
    estoqueId || (itens.find(i => (i as any).estoqueId)?.estoqueId as any) || '';

  const handleEditarField = async (id: string, campo: keyof ProdutoEstoqueAPI, valor: any) => {
    try {
      const item = itens.find(i => i.id === id);
      if (!item) return;

      const atual = { ...item, [campo]: valor } as any;
      const caixas = toNumber(atual.caixas);
      const unidades = Math.max(1, toNumber(atual.unidades_por_caixa));
      const novaQtd = caixas * unidades;

      const numericos: (keyof ProdutoEstoqueAPI)[] = [
        'preco_compra', 'preco_venda_unidade', 'preco_venda_caixa',
        'caixas', 'unidades_por_caixa', 'quantidade_em_estoque',
      ];

      const payload: any = numericos.includes(campo)
        ? ({ [campo]: toNumber(valor) } as any)
        : ({ [campo]: valor } as any);

      // duplica para camelCase quando for campo snake_case
      const snakeToCamel: Record<string, string> = {
        preco_compra: 'precoCompra',
        preco_venda_unidade: 'precoVendaUnidade',
        preco_venda_caixa: 'precoVendaCaixa',
        unidades_por_caixa: 'unidadesPorCaixa',
        quantidade_em_estoque: 'quantidadeEmEstoque',
        caixas: 'caixas', // geralmente igual em ambos
      };
      const camKey = snakeToCamel[campo as string];
      if (camKey) payload[camKey] = payload[campo];

      if (campo === 'caixas' || campo === 'unidades_por_caixa') {
        // Quantidade derivada
        payload.quantidade_em_estoque = novaQtd;
        payload.quantidadeEmEstoque  = novaQtd;

        // Unidades por caixa coerente em ambos formatos
        payload.unidades_por_caixa = unidades;
        payload.unidadesPorCaixa   = unidades;

        // Mantém preço unitário consistente
        const preco = toNumber(atual.preco_venda_caixa);
        const pu = preco / Math.max(1, unidades);
        payload.preco_venda_unidade = pu;
        payload.precoVendaUnidade   = pu;
      }

      if (campo === 'preco_venda_caixa') {
        const u = Math.max(1, toNumber(atual.unidades_por_caixa));
        const precoCx = toNumber(valor);

        payload.preco_venda_caixa = precoCx;
        payload.precoVendaCaixa   = precoCx;

        const pu = precoCx / u;
        payload.preco_venda_unidade = pu;
        payload.precoVendaUnidade   = pu;
      }

      await api.put(`/produtoestoque/${id}`, payload);
      carregarEstoque();
    } catch (e) {
      console.error('Erro ao editar item:', e);
    }
  };

  const handleRemover = async (id: string) => {
    if (isCategoriaVazia(id)) return;
    try {
      await api.delete(`/produtoestoque/${id}`);
      carregarEstoque();
    } catch (e) {
      console.error('Erro ao remover item:', e);
    }
  };

  const excluirGrupoOuCabecalho = async () => {
    try {
      if (!effectiveEstoqueId) {
        alert('Nenhum estoque válido associado a este grupo.');
        return;
      }

      const idCategoria = itens[0]?.id;
      const url = `/produtoestoque/grupo?marca=${encodeURIComponent(categoria)}&tipo=${encodeURIComponent(tipo)}&estoqueId=${encodeURIComponent(effectiveEstoqueId)}`;

      if (!idCategoria) {
        await api.delete(url);
        carregarEstoque();
        return;
      }
      if (idCategoria.startsWith('vazio-')) {
        const idReal = idCategoria.replace(/^vazio-/, '');
        await api.delete(`/categoriaestoque/${idReal}`);
      } else {
        await api.delete(url);
      }
      carregarEstoque();
    } catch (e) {
      console.error('Erro ao excluir grupo/cabeçalho:', e);
    }
  };

  const itensOrdenados = useMemo(
    () => [...itens].sort((a, b) => (a.id ?? '').localeCompare(b.id ?? '')),
    [itens]
  );

  const abrirLinhaRascunho = () => {
    if (!effectiveEstoqueId) {
      alert('Selecione ou crie um estoque antes de adicionar itens.');
      return;
    }
    setAbrirDraft(true);
  };

  return (
    <div
      className="border rounded-lg shadow mb-6"
      style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.destaque, borderWidth: '1px' }}
    >
      <HeaderTabelaEstoque
        titulo={`${categoria.toUpperCase()} - ${tipo}`}
        temaAtual={temaAtual}
        onAdicionar={abrirLinhaRascunho}
        onExcluirGrupo={excluirGrupoOuCabecalho}
        addDisabled={!effectiveEstoqueId}
        addTitle="Adicionar novo item"
        deleteTitle="Excluir grupo inteiro"
      />

      <div className="overflow-y-auto" style={{ maxHeight: '300px' }}>
        <table className="w-full text-sm">
          <thead>
            <tr style={{ backgroundColor: temaAtual.fundoAlt, color: temaAtual.texto }}>
              <th className="px-2 py-1 text-left">Código</th>
              <th className="px-2 py-1 text-left">Nome</th>
              <th className="px-2 py-1 text-left">Caixas</th>
              <th className="px-2 py-1 text-left">Unid/Caixa</th>
              <th className="px-2 py-1 text-left">Total Unid.</th>
              <th className="px-2 py-1 text-left">Preço Caixa</th>
              <th className="px-2 py-1 text-left">Preço Unit.</th>
              <th className="px-2 py-1 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {abrirDraft && (
              <LinhaTabelaEstoque
                isDraft
                item={{
                  id: 'draft',
                  codigo: gerarCodigoAuto(categoria),
                  nome: '',
                  marca: categoria,
                  tipo,
                  caixas: 0,
                  unidades_por_caixa: 1,
                  preco_venda_caixa: 0,
                  preco_venda_unidade: 0,
                  quantidade_em_estoque: 0,
                } as any}
                temaAtual={temaAtual}
                disabled={false}
                estoqueId={effectiveEstoqueId}
                filialId={filialId}
                filialCidade={filialCidade}
                onCreated={() => { setAbrirDraft(false); carregarEstoque(); }}
                onCancelDraft={() => setAbrirDraft(false)}
              />
            )}

            {itensOrdenados.map(item => {
              const disabled = isCategoriaVazia(item.id);
              return (
                <LinhaTabelaEstoque
                  key={item.id}
                  item={item}
                  temaAtual={temaAtual}
                  disabled={disabled}
                  onSaveField={handleEditarField}
                  onRemove={handleRemover}
                  filialId={filialId}
                  estoqueId={effectiveEstoqueId}
                  filialCidade={filialCidade}
                />
              );
            })}

            {itens.length === 0 && !abrirDraft && (
              <tr>
                <td colSpan={8} className="text-center py-4 italic">
                  Nenhum item cadastrado nesta categoria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TabelaEstoque;
