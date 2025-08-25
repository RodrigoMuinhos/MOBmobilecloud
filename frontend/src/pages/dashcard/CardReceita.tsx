'use client';
import React from 'react';
import { FaDollarSign } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  receita: number;
  label: string;
}

const CardReceita: React.FC<Props> = ({ receita, label }) => {
  const { temaAtual } = useTheme();

  return (
    <div
      className="relative rounded-lg shadow-md p-5 flex items-center gap-4 border-l-4 transition-all duration-300"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
      }}
    >
      <div className="text-3xl" style={{ color: temaAtual.destaque }}>
        <FaDollarSign />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          R$ {receita.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </p>
      </div>
    </div>
  );
};

export default CardReceita;
