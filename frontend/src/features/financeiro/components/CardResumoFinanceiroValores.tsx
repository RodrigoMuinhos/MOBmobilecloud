'use client';
import React, { useEffect, useState } from 'react';
import { VendaAPI, ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';

interface Props {
  vendas: VendaAPI[];
}

const CardResumoFinanceiroValores: React.FC<Props> = ({ vendas }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].relatorio;

  const [valorTotal, setValorTotal] = useState(0);
  const [valorPago, setValorPago] = useState(0);
  const [valorAberto, setValorAberto] = useState(0);
  const [descontos, setDescontos] = useState(0);

  useEffect(() => {
    calcularTotais(vendas);
  }, [vendas]);

  const calcularTotais = (vendas: VendaAPI[]) => {
    let total = 0;
    let pago = 0;
    let aberto = 0;
    let desconto = 0;

    vendas.forEach((venda) => {
      const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];

      const subtotal = carrinho.reduce((acc, item) => {
        const qtd = Number(item.quantidade) || 0;
        const preco = Number(item.precoUnitario ?? item.preco) || 0;
        return acc + qtd * preco;
      }, 0);

      const frete = Number(venda.frete) || 0;
      const acrescimo = Number(venda.acrescimo) || 0;
      const desc = Number(venda.descontoValor) || 0;

      const valorFinal = subtotal - desc + frete + acrescimo;

      total += valorFinal;
      desconto += desc;

      if (venda.status_pagamento === 'pago') {
        pago += valorFinal;
      } else {
        aberto += valorFinal;
      }
    });

    setValorTotal(total);
    setValorPago(pago);
    setValorAberto(aberto);
    setDescontos(desconto);
  };

  const formatar = (valor: number, prefix = '') =>
    `${prefix}R$ ${valor.toFixed(2)}`.replace('.', ',');

  return (
    <div
      className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
      style={{ color: temaAtual.texto }}
    >
      <div className="rounded shadow p-4" style={{ backgroundColor: temaAtual.card }}>
        <p className="text-sm font-medium">{t.valorPago}</p>
        <p className="text-lg font-bold text-green-500">{formatar(valorPago)}</p>
      </div>

      <div className="rounded shadow p-4" style={{ backgroundColor: temaAtual.card }}>
        <p className="text-sm font-medium">{t.valorAberto}</p>
        <p className="text-lg font-bold text-red-500">{formatar(valorAberto, '-')}</p>
      </div>

      <div className="rounded shadow p-4" style={{ backgroundColor: temaAtual.card }}>
        <p className="text-sm font-medium">{t.descontosDados}</p>
        <p className="text-lg font-bold text-blue-500">{formatar(descontos, '-')}</p>
      </div>

      <div className="rounded shadow p-4 border-t" style={{ backgroundColor: temaAtual.card }}>
        <p className="text-sm font-medium font-bold">{t.valorTotal}</p>
        <p className="text-lg font-bold text-green-400">{formatar(valorTotal)}</p>
      </div>
    </div>
  );
};

export default CardResumoFinanceiroValores;
