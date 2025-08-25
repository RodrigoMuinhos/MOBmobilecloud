'use client';
import React from 'react';
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend);

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
  const valorInvestido = valorCompra * quantidadeComprada;
  const receitaTotal = valorVenda * quantidadeVendida;
  const lucroTotal = receitaTotal - valorInvestido;
  const saldoFinal = lucroTotal - valorInvestido;

  const data = {
    labels: ['Resultado'],
    datasets: [
      {
        label: 'Valor Investido',
        data: [valorInvestido],
        borderColor: 'orange',
        backgroundColor: 'orange',
        tension: 0.4,
      },
      {
        label: 'Lucro Total',
        data: [lucroTotal],
        borderColor: 'green',
        backgroundColor: 'green',
        tension: 0.4,
      },
      {
        label: 'Saldo Final',
        data: [saldoFinal],
        borderColor: 'pink',
        backgroundColor: 'pink',
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
        },
      },
    },
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg mb-2">Gráfico: Investimento vs Lucro</h2>
      <Line data={data} options={options} />
    </div>
  );
};

export default GraficoInvestimentoLucro;