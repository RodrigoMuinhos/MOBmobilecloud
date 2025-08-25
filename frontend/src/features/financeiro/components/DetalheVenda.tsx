'use client';
import React, { useMemo } from 'react';
import { FaCircle, FaTrash } from 'react-icons/fa';
import { VendaAPI, ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

import TabelaProdutosDaVenda from './TabelaProdutosDaVenda';
import ResumoFinanceiroDaVenda from './ResumoFinanceiroDaVenda';

const formatarData = (dataString?: string): string => {
  if (!dataString) return 'Data indisponível';
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

  const totalProdutos = carrinho.reduce((soma: number, p: ItemCarrinhoAPI) => {
    const qtd = Number(p.quantidade) || 0;
    const preco = Number(p.precoUnitario) || 0;
    return soma + qtd * preco;
  }, 0);

  const desconto = Number(venda.descontoValor) || 0;
  const frete = Number(venda.frete) || 0;
  const acrescimo = Number(venda.acrescimo) || 0;
  const totalFinal = totalProdutos - desconto + frete + acrescimo;

  return { desconto, frete, acrescimo, totalFinal, produtos: carrinho };
};

export type DetalheVendaProps = {
  venda: VendaAPI;
  onToggleStatus: (vendaId: string) => void;
  onExcluir: (vendaId: string) => void;
};

const DetalheVenda: React.FC<DetalheVendaProps> = ({ venda, onToggleStatus, onExcluir }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  const { desconto, frete, acrescimo, totalFinal, produtos } = useMemo(
    () => calcularTotaisVenda(venda),
    [venda]
  );

  return (
    <div className="mb-4 border rounded p-3" style={{ borderColor: temaAtual.destaque }}>
      <div className="flex justify-between items-start text-sm mb-3">
        <div className="space-y-1">
          <div><strong>{t.compraEm}:</strong> {formatarData(venda.data)}</div>
          <div><strong>{t.total}:</strong> R$ {totalFinal.toFixed(2)}</div>
          {venda.cliente?.estado && <div><strong>UF:</strong> {venda.cliente.estado}</div>}
        </div>
        <div className="flex items-center gap-3">
          {venda.id && (
            <>
              <FaCircle
                className={`cursor-pointer text-lg ${venda.status_pagamento === 'pago' ? 'text-green-600' : 'text-red-600'}`}
                title={venda.status_pagamento === 'pago' ? t.pago : t.naoPago}
                onClick={() => onToggleStatus(venda.id!)}
              />
              <button
                onClick={() => onExcluir(venda.id!)}
                className="text-gray-500 hover:text-red-600"
                title={t.excluirVenda}
              >
                <FaTrash />
              </button>
            </>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          <TabelaProdutosDaVenda produtos={produtos} />
        </div>
        <div className="w-full md:w-1/4 flex-shrink-0">
        <ResumoFinanceiroDaVenda
  desconto={venda.descontoValor}
  frete={venda.frete}
  acrescimo={venda.acrescimo}
  total={venda.totalFinal}
/>
        </div>
      </div>
    </div>
  );
};

export default DetalheVenda;
