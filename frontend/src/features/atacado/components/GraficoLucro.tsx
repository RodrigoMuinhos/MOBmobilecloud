'use client';
import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  precoCompra: number;
  precoVendaAtacado: number;
  precoVendaVarejo?: number; // opcional
  quantidade: number;
};

const GraficoDonutUnidades: React.FC<Props> = ({
  precoCompra,
  precoVendaAtacado,
  precoVendaVarejo,
  quantidade,
}) => {
  const valorCompra = precoCompra * quantidade;
  const valorAtacado = precoVendaAtacado * quantidade;
  const valorVarejo = precoVendaVarejo ? precoVendaVarejo * quantidade : 0;

  const data = {
    labels: ['Investimento', 'Venda Atacado', 'Venda Varejo'],
    datasets: [
      {
        data: [valorCompra, valorAtacado, valorVarejo],
        backgroundColor: ['orange', 'green', 'blue'],
        hoverOffset: 8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  return (
    <div className="w-full">
      <h2 className="font-bold text-lg mb-2">Relação por Unidade e Quantidade</h2>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default GraficoDonutUnidades;