'use client';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import { VendaAPI, ItemCarrinhoAPI } from '../../../types/api/vendaApi.types';

import {
  FaMoneyBillWave,
  FaHourglassHalf,
  FaTag,
  FaCalculator,
} from 'react-icons/fa';

import ChartDataLabels from 'chartjs-plugin-datalabels';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

const formatarMoeda = (valor: number): string =>
  valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const calcularResumoFinanceiro = (vendas: VendaAPI[]) => {
  const modelos: Record<string, number> = {};
  const marcas: Record<string, number> = {};
  let total = 0, pago = 0, aberto = 0, desconto = 0;

  vendas.forEach((venda) => {
    const carrinho: ItemCarrinhoAPI[] = Array.isArray(venda.carrinho) ? venda.carrinho : [];

    carrinho.forEach((item: ItemCarrinhoAPI) => {
      const marca = item.nome?.split(' / ')[0] || '';
      const modelo = item.nome?.trim().split(' ').pop() || '';

      if (marca) {
        marcas[marca] = (marcas[marca] || 0) + (item.quantidade || 0);
      }

      if (modelo) {
        modelos[modelo] = (modelos[modelo] || 0) + (item.quantidade || 0);
      }
    });

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

  return { modelos, marcas, total, pago, aberto, desconto };
};

interface Props {
  vendas: VendaAPI[];
}

const GraficoResumoFinanceiro: React.FC<Props> = ({ vendas }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].financeiro;

  const [modelos, setModelos] = useState<Record<string, number>>({});
  const [marcas, setMarcas] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);
  const [valorPago, setValorPago] = useState(0);
  const [valorAberto, setValorAberto] = useState(0);
  const [valorDesconto, setValorDesconto] = useState(0);

  useEffect(() => {
    const { modelos, marcas, total, pago, aberto, desconto } = calcularResumoFinanceiro(vendas);
    setModelos(modelos);
    setMarcas(marcas);
    setTotal(total);
    setValorPago(pago);
    setValorAberto(aberto);
    setValorDesconto(desconto);
  }, [vendas]);

  const criarDadosGrafico = (
    data: Record<string, number>,
    maxItems: number,
    corPrincipal: string,
    corAlternativa: string
  ) => {
    const entradas = Object.entries(data).sort((a, b) => b[1] - a[1]).slice(0, maxItems);
    const max = Math.max(...entradas.map(([_, qtd]) => qtd), 0);

    return {
      labels: entradas.map(([nome]) => nome),
      datasets: [
        {
          label: 'Qtd',
          data: entradas.map(([_, qtd]) => qtd),
          backgroundColor: entradas.map(([_, qtd]) =>
            qtd === max ? corPrincipal : corAlternativa
          ),
        },
      ],
    };
  };

  const opcoesGrafico: ChartOptions<'bar'> = {
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: temaAtual.texto,
        font: { weight: 'bold', size: 11 },
      },
      tooltip: {
        callbacks: {
          label: function (ctx) {
            return `Qtd: ${ctx.raw}`;
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };

  return (
    <>
      <div
        className="w-full h-full shadow rounded p-4 flex flex-col"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-sm font-semibold mb-2">{t.modelosMaisVendidos}</h2>
        <div className="flex-1 min-h-[160px] overflow-x-auto">
          <Bar
            data={criarDadosGrafico(modelos, 10, '#E68C3A', '#336021')}
            options={opcoesGrafico}
            aria-label="Gráfico de Modelos"
          />
        </div>
      </div>

      <div
        className="w-full h-full shadow rounded p-4 flex flex-col"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-sm font-semibold mb-2">{t.topCartuchos}</h2>
        <div className="flex-1 min-h-[160px] overflow-x-auto">
          <Bar
            data={criarDadosGrafico(marcas, 5, '#E68C3A', '#C0C0C0')}
            options={opcoesGrafico}
            aria-label="Gráfico de Marcas"
          />
        </div>
      </div>

      <div
        className="w-full h-full shadow rounded p-4 flex flex-col gap-2"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <h2 className="text-sm font-semibold mb-1">{t.totalVendido}</h2>

        <div className="flex justify-between items-center text-base font-medium">
          <div className="flex items-center gap-2 text-green-500">
            <FaMoneyBillWave />
            <span>{t.valorPago}</span>
          </div>
          <span className="font-bold text-green-500">{formatarMoeda(valorPago)}</span>
        </div>

        <div className="flex justify-between items-center text-base font-medium">
          <div className="flex items-center gap-2 text-red-500">
            <FaHourglassHalf />
            <span>{t.valorAberto}</span>
          </div>
          <span className="font-bold text-red-500">{formatarMoeda(valorAberto)}</span>
        </div>

        <div className="flex justify-between items-center text-base font-medium">
          <div className="flex items-center gap-2 text-blue-500">
            <FaTag />
            <span>{t.descontosDados}</span>
          </div>
          <span className="font-bold text-blue-500">- {formatarMoeda(valorDesconto)}</span>
        </div>

        <hr className="my-1 border-gray-400" />

        <div className="flex justify-between items-center text-lg font-bold mt-1">
          <div className="flex items-center gap-2">
            <FaCalculator />
            <span>{t.valorTotal}</span>
          </div>
          <span className="text-green-600 dark:text-green-400">{formatarMoeda(total)}</span>
        </div>
      </div>
    </>
  );
};

export default GraficoResumoFinanceiro;
