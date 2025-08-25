// src/features/biblioteca/components/GraficoDistribuicaoUFBar.tsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
  Cell,
  Legend,
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  listaUFs: { uf: string; quantidade: number }[];
  cores: string[];
};

const GraficoDistribuicaoUFBar: React.FC<Props> = ({ listaUFs, cores }) => {
  const { temaAtual } = useTheme();

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Contatos por Estado (UF)</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={listaUFs}>
          <XAxis dataKey="uf" stroke={temaAtual.texto} />
          <YAxis stroke={temaAtual.texto} />
          <Tooltip />
          <Legend />
          <Bar dataKey="quantidade">
            {listaUFs.map((_, index) => (
              <Cell key={index} fill={cores[index % cores.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoDistribuicaoUFBar;
