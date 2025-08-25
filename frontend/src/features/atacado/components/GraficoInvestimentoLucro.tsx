'use client';

import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '../../../context/ThemeContext';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, ChartDataLabels);

type Props = {
  valorCompra: number;
  quantidadeComprada: number;
  valorVenda: number;
  quantidadeVendida: number;
};

const GraficoInvestimentoLucro: React.FC<Props> = ({
  valorCompra,
  quantidadeComprada,
  valorVenda,
  quantidadeVendida,
}) => {
  const { temaAtual } = useTheme();

  const valorInvestido = valorCompra * quantidadeComprada;
  const receitaTotal = valorVenda * quantidadeVendida;
  const lucroTotal = receitaTotal - valorInvestido;
  const saldoFinal = lucroTotal - valorInvestido;

  const data = {
    labels: ['Início', 'Meio', 'Resultado'],
    datasets: [
      {
        label: 'Valor Investido',
        data: [valorInvestido * 0.6, valorInvestido * 0.8, valorInvestido],
        borderColor: '#A8261E',
        backgroundColor: '#A8261E',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Lucro Total',
        data: [lucroTotal * 0.4, lucroTotal * 0.7, lucroTotal],
        borderColor: '#3A7550',
        backgroundColor: '#3A7550',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
      {
        label: 'Saldo Final',
        data: [saldoFinal * 0.2, saldoFinal * 0.6, saldoFinal],
        borderColor: '#FF8332',
        backgroundColor: '#FF8332',
        tension: 0.4,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          color: temaAtual.texto,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `R$ ${ctx.raw.toFixed(2)}`,
        },
      },
      datalabels: {
        display: false, // 👈 desativa o plugin completamente
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: temaAtual.texto,
          callback: (value: number) => `R$ ${value.toFixed(0)}`,
        },
      },
      x: {
        ticks: {
          color: temaAtual.texto,
        },
      },
    },
  };

  return (
    <div className="w-full h-[300px] rounded-lg p-4" style={{ background: temaAtual.card }}>
      <Line data={data} options={options as any} />
    </div>
  );
};

export default GraficoInvestimentoLucro;