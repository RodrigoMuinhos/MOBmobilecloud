'use client';
import React, { useMemo, useCallback } from 'react';
import { FaCircle, FaTrash } from 'react-icons/fa';
import { VendaAPI, ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import api from '../../../services/api';

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(isNaN(valor) ? 0 : valor);

const formatarData = (dataString: string): string => {
  const data = new Date(dataString);
  if (isNaN(data.getTime())) return 'Data indisponível';
  return data.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const calcularTotaisVenda = (venda: VendaAPI) => {
  const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];

  const totalProdutos = carrinho.reduce((soma: number, p) => {
    const qtd = Number(p.quantidade) || 0;
    const precoUnitario = Number(p.precoUnitario ?? p.preco) || 0;
    return soma + qtd * precoUnitario;
  }, 0);

  const desconto = Number(venda.descontoValor) || 0;
  const frete = Number(venda.frete) || 0;
  const acrescimo = Number(venda.acrescimo) || 0;
  const totalFinal = totalProdutos - desconto + frete + acrescimo;

  return { desconto, frete, acrescimo, totalFinal, carrinho };
};

type DetalheVendaProps = {
  venda: VendaAPI;
  onToggleStatus: (venda: VendaAPI) => void;
  onExcluir: (venda: VendaAPI) => void;
};

const DetalheVenda: React.FC<DetalheVendaProps> = ({ venda, onToggleStatus, onExcluir }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  const { desconto, frete, acrescimo, totalFinal, carrinho } = useMemo(
    () => calcularTotaisVenda(venda),
    [venda]
  );

  return (
    <div className="mb-4 border rounded p-3" style={{ borderColor: temaAtual.destaque }}>
      <div className="flex justify-between items-start text-sm mb-3">
        <div className="space-y-1">
          <div>
            <strong>{t.compraEm}:</strong> {formatarData(venda.data ?? '')}
          </div>
          <div>
            <strong>{t.total}:</strong> {formatarMoeda(totalFinal)}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <FaCircle
            className={`cursor-pointer text-lg ${
              venda.status_pagamento === 'pago' ? 'text-green-600' : 'text-red-600'
            }`}
            title={venda.status_pagamento === 'pago' ? t.pago : t.naoPago}
            onClick={() => onToggleStatus(venda)}
          />
          <button
            onClick={() => onExcluir(venda)}
            className="text-gray-500 hover:text-red-600"
            title={t.excluirVenda}
          >
            <FaTrash />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <table className="min-w-full text-xs border rounded">
            <thead
              style={{
                backgroundColor: temaAtual.destaque,
                color: temaAtual.textoBranco,
              }}
            >
              <tr>
                <th className="p-1 text-left">{t.produto}</th>
                <th className="p-1 text-center w-16">{t.quantidade}</th>
                <th className="p-1 text-right w-24">{t.unitario}</th>
                <th className="p-1 text-right w-24">{t.subtotal}</th>
              </tr>
            </thead>
            <tbody>
              {carrinho.map((item, idx) => {
                const quantidade = Number(item.quantidade) || 0;
                const precoUnitario = Number(item.precoUnitario ?? item.preco) || 0;
                const subtotal = quantidade * precoUnitario;

                return (
                  <tr key={idx} className="border-t" style={{ borderColor: temaAtual.card }}>
                    <td className="p-1 text-left">{item.nome}</td>
                    <td className="p-1 text-center">{quantidade}</td>
                    <td className="p-1 text-right">{formatarMoeda(precoUnitario)}</td>
                    <td className="p-1 text-right">{formatarMoeda(subtotal)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="w-full md:w-1/4 flex-shrink-0">
          <div
            className="p-2 border rounded space-y-1 text-sm"
            style={{ borderColor: temaAtual.destaque }}
          >
            <div className="flex justify-between">
              <span>{t.descontoGeral}:</span> <span>{formatarMoeda(desconto)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.frete}:</span> <span>{formatarMoeda(frete)}</span>
            </div>
            <div className="flex justify-between">
              <span>{t.acrescimo}:</span> <span>{formatarMoeda(acrescimo)}</span>
            </div>
            <div
              className="border-t pt-1 mt-1 font-bold flex justify-between"
              style={{ borderColor: temaAtual.destaque }}
            >
              <span>{t.total}:</span> <span>{formatarMoeda(totalFinal)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type Props = {
  lista: VendaAPI[];
  vendas: VendaAPI[];
  onAtualizarVendas: (v: VendaAPI[]) => void;
};

const HistoricoComprasCliente: React.FC<Props> = ({ lista, vendas, onAtualizarVendas }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  const handleToggleStatus = useCallback(
    async (venda: VendaAPI) => {
      const novoStatus: 'pago' | 'pendente' =
        venda.status_pagamento === 'pago' ? 'pendente' : 'pago';

      try {
        await api.put(`/vendas/${venda.id}`, {
          status_pagamento: novoStatus,
        });

        const vendasAtualizadas = vendas.map((v) =>
          v.id === venda.id ? { ...v, status_pagamento: novoStatus } : v
        );
        onAtualizarVendas(vendasAtualizadas);
      } catch (error) {
        console.error('Erro ao atualizar status:', error);
        alert('Erro ao atualizar status da venda.');
      }
    },
    [vendas, onAtualizarVendas]
  );

  const handleExcluirVenda = useCallback(
    async (venda: VendaAPI) => {
      if (!window.confirm(t.confirmarLixeira)) return;

      try {
        await api.delete(`/vendas/${venda.id}`);
        const vendasAtualizadas = vendas.filter((v) => v.id !== venda.id);
        onAtualizarVendas(vendasAtualizadas);
      } catch (error) {
        console.error('Erro ao excluir venda:', error);
        alert('Erro ao excluir venda.');
      }
    },
    [vendas, onAtualizarVendas, t.confirmarLixeira]
  );

  return (
    <tr>
      <td colSpan={7} className="p-4" style={{ backgroundColor: temaAtual.fundoAlt }}>
        <h4 className="text-sm font-semibold mb-2">{t.historicoCompras}</h4>
        {lista.map((venda) => (
          <DetalheVenda
            key={venda.id}
            venda={venda}
            onToggleStatus={handleToggleStatus}
            onExcluir={handleExcluirVenda}
          />
        ))}
      </td>
    </tr>
  );
};

export default HistoricoComprasCliente;
