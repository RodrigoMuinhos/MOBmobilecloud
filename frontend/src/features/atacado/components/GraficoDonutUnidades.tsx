'use client';

import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useTheme } from '../../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

type Props = {
  precoCompra: number;
  precoVendaVarejo: number;
  quantidade: number;
};

const GraficoDonutUnidades: React.FC<Props> = ({
  precoCompra,
  precoVendaVarejo,
  quantidade,
}) => {
  const { temaAtual } = useTheme();

  const valorInvestido = precoCompra * quantidade;
  const valorVendaVarejo = precoVendaVarejo * quantidade;
  const lucroTotal = valorVendaVarejo - valorInvestido;

  const data = {
    labels: ['Investido', 'Venda Varejo', 'Lucro'],
    datasets: [
      {
        data: [valorInvestido, valorVendaVarejo, lucroTotal],
        backgroundColor: ['#A8261E', '#3A7550', '#FF8332'], // paleta ordenada
        borderColor: '#fff',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `R$ ${ctx.raw.toFixed(2)}`,
        },
      },
      datalabels: {
        color: 'white',
        font: {
          weight: 'bold' as const,
          size: 14,
        },
        formatter: (value: number) => `R$ ${value.toFixed(0)}`,
      },
    },
  };

  const legenda = [
    { cor: '#A8261E', valor: valorInvestido },
    { cor: '#3A7550', valor: valorVendaVarejo },
    { cor: '#FF8332', valor: lucroTotal },
  ];

  return (
    <div
      className="w-full md:flex gap-6 h-[300px] rounded-lg p-4"
      style={{ background: temaAtual.card, color: temaAtual.texto }}
    >
      <div className="flex-1 h-full">
        <Doughnut data={data} options={options as any} />
      </div>

      <div className="mt-4 md:mt-0 md:w-[180px] space-y-3 text-sm flex flex-col justify-center">
        {legenda.map((item, index) => (
          <div key={index} className="flex justify-between items-center text-[14px]">
            <span className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: item.cor }}
              ></span>
            </span>
            <span className="font-medium">R$ {item.valor.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GraficoDonutUnidades;