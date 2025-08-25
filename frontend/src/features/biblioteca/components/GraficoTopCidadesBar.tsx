import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { useTheme } from '../../../context/ThemeContext';

interface CidadeQuantidade {
  cidade: string;
  quantidade: number;
}

interface Props {
  listaCidades: CidadeQuantidade[];
}

const cores = [
  '#8884d8', '#82ca9d', '#ffc658', '#ff8042',
  '#d0ed57', '#a4de6c', '#8dd1e1', '#83a6ed',
  '#ffbb28', '#ff6666', '#00c49f'
];

const GraficoTopCidadesBar: React.FC<Props> = ({ listaCidades }) => {
  const { temaAtual } = useTheme();

  const topCidades = listaCidades.slice(0, 10);

  return (
    <div className="p-4 rounded-md shadow-md" style={{ background: temaAtual.card, color: temaAtual.texto }}>
      <h2 className="text-xl font-bold mb-4">Top 10 Cidades com Mais Contatos</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={topCidades}>
          <XAxis dataKey="cidade" stroke={temaAtual.texto} tick={{ fill: temaAtual.texto }} />
          <YAxis stroke={temaAtual.texto} tick={{ fill: temaAtual.texto }} />
          <Tooltip
            contentStyle={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              borderRadius: 8,
              border: `1px solid ${temaAtual.texto}`
            }}
          />
          <Bar dataKey="quantidade">
            {topCidades.map((_, index) => (
              <Cell key={index} fill={cores[index % cores.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GraficoTopCidadesBar;
