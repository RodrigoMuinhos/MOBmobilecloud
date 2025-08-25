// src/features/biblioteca/components/GraficoPorUF.tsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface Props {
  valido: number;
  invalido: number;
}

const GraficoPorUF: React.FC<Props> = ({ valido, invalido }) => {
  const data = [
    { name: 'Válido', value: valido },
    { name: 'Inválido', value: invalido },
  ];

  const COLORS = ['#00C49F', '#FF8042'];

  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Validados x Inválidos</h2>
      <PieChart width={300} height={200}>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default GraficoPorUF;
