'use client';
import React from 'react';
import { Venda } from '../../../types/banco';
import GraficosCentrais from './GraficosCentrais';

type Props = {
  vendas: Venda[];
};

const DashboardCharts: React.FC<Props> = ({ vendas }) => {
  return (
    <div className="relative">
      <span
        className="absolute -top-3 right-0 bg-blue-600 text-white text-[10px] px-2 py-[1px] rounded-bl z-10 font-bold"
      >
        GRÁFICOS DASHBOARD
      </span>
      <GraficosCentrais vendas={vendas} />
    </div>
  );
};

export default DashboardCharts;
