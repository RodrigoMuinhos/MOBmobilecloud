'use client';
import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  data: { nome: string; valor: number }[];
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AA66CC'];

const EstoqueGraficoPizza: React.FC<Props> = ({ data }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();

  const t = language.estoque;

  return (
    <div
      className="rounded-xl p-4 shadow-md"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        border: `1px solid ${temaAtual.destaque}`,
      }}
    >
      <h3 className="text-lg font-bold mb-4" style={{ color: temaAtual.texto }}>
        {t.visaoEstoque || 'Distribuição de Valores'}
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            dataKey="valor"
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={({ name }) => name}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value: any) => `R$ ${value.toFixed(2)}`} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default EstoqueGraficoPizza;
