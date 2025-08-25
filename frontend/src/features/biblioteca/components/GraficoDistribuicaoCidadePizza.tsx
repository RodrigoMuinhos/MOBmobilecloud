// src/features/biblioteca/components/GraficoDistribuicaoCidadePizza.tsx

import React from 'react';
import { PieChart, Pie, Cell, Tooltip } from 'recharts';

interface CidadeQuantidade {
  cidade: string;
  quantidade: number;
}

interface Props {
  listaCidades: CidadeQuantidade[];
  cores: string[];
}

const GraficoDistribuicaoCidadePizza: React.FC<Props> = ({ listaCidades, cores }) => {
  return (
    <div>
      <h2 className="text-lg font-semibold mb-2">Distribuição por Cidade</h2>
      <PieChart width={400} height={250}>
        <Pie
          data={listaCidades}
          dataKey="quantidade"
          nameKey="cidade"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {listaCidades.map((_, index) => (
            <Cell key={index} fill={cores[index % cores.length]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </div>
  );
};

export default GraficoDistribuicaoCidadePizza;
