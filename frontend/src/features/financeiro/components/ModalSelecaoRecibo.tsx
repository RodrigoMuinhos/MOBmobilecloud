'use client';

import React from 'react';
import { VendaAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useIdioma } from '../../../context/IdiomaContext';
import { FaTimes, FaReceipt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa';

type Props = {
  lista: VendaAPI[];
  onSelecionar: (venda: VendaAPI) => void;
  onCancelar: () => void;
};

const formatarMoeda = (valor: number): string =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

const formatarData = (dataString?: string): string => {
  if (!dataString) return 'Data indisponível';
  const data = new Date(dataString);
  return isNaN(data.getTime())
    ? 'Data inválida'
    : data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const calcularTotalVenda = (venda: VendaAPI): number => {
  const produtos = venda.produtos || [];
  const totalProdutos = produtos.reduce((soma, p) => {
    const qtd = Number(p.quantidade) || 0;
    const preco = Number(p.precoUnitario) || 0;
    return soma + qtd * preco;
  }, 0);

  const desconto = Number(venda.descontoValor) || 0;
  const frete = Number(venda.frete) || 0;
  const acrescimo = Number(venda.acrescimo) || 0;

  return totalProdutos - desconto + frete + acrescimo;
};

const ModalSelecaoRecibo: React.FC<Props> = ({ lista, onSelecionar, onCancelar }) => {
  const { temaAtual } = useTheme();
  const { idioma } = useIdioma();
  const t = idioma.relatorio;

  if (!lista?.length) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onCancelar} />

      <div
        className="fixed top-1/2 left-1/2 w-[90%] md:w-[700px] max-h-[80vh] transform -translate-x-1/2 -translate-y-1/2 rounded-xl shadow-2xl z-50 overflow-hidden"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <div
          className="flex justify-between items-center p-4 border-b"
          style={{ borderColor: temaAtual.destaque }}
        >
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FaReceipt />
              {t?.selecionarRecibo || 'Selecionar Recibo'}
            </h2>
            <p className="text-sm opacity-75 mt-1">
              {lista.length} {lista.length === 1 ? 'venda encontrada' : 'vendas encontradas'}
            </p>
          </div>
          <button
            onClick={onCancelar}
            className="text-gray-500 hover:text-red-500 transition-colors p-2"
            title={t?.fechar || 'Fechar'}
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4">
          <div className="space-y-3">
            {lista.map((venda, index) => {
              const totalVenda = calcularTotalVenda(venda);
              const quantidadeItens = (venda.produtos || []).reduce(
                (soma, p) => soma + (Number(p.quantidade) || 0),
                0
              );

              const statusPagamento = venda.status_pagamento ?? 'pendente';

              return (
                <div
                  key={venda.id || index}
                  className="border rounded-lg p-4 cursor-pointer transition-all duration-200 hover:shadow-md"
                  style={{
                    borderColor: temaAtual.destaque,
                    backgroundColor: temaAtual.fundo,
                  }}
                  onClick={() => onSelecionar(venda)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-grow">
                      <div className="flex items-center gap-2 mb-2">
                        <FaCalendarAlt className="text-blue-500" size={14} />
                        <span className="font-semibold">
                          {formatarData(venda.data || venda.criadoEm)}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusPagamento === 'pago'
                              ? 'bg-green-100 text-green-800'
                              : statusPagamento === 'pendente'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {statusPagamento === 'pago'
                            ? t.pago
                            : statusPagamento === 'pendente'
                            ? t.pendente || 'Pendente'
                            : 'Cancelado'}
                        </span>
                      </div>

                      <div className="text-sm space-y-1 opacity-80">
                        <div>
                          <strong>{t.nomeCliente || 'Cliente'}:</strong>{' '}
                          {venda.cliente?.nome || 'N/A'}
                        </div>
                        <div>
                          <strong>{t.itens || 'Itens'}:</strong> {quantidadeItens} unidades
                        </div>
                        <div>
                          <strong>{t.pagamento || 'Pagamento'}:</strong>{' '}
                          {venda.formaPagamento || 'N/A'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div
                        className="flex items-center gap-1 text-lg font-bold"
                        style={{ color: temaAtual.destaque }}
                      >
                        <FaDollarSign size={16} />
                        {formatarMoeda(totalVenda)}
                      </div>
                      <div className="text-xs opacity-60 mt-1">Clique para ver recibo</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-4 border-t flex justify-end" style={{ borderColor: temaAtual.destaque }}>
          <button
            onClick={onCancelar}
            className="px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: temaAtual.destaque, color: temaAtual.texto }}
          >
            {t.cancelar || 'Cancelar'}
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalSelecaoRecibo;
