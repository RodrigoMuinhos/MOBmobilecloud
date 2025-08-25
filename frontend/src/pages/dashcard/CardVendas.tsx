'use client';
import React from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  vendas: number;
  label: string;
}

const CardVendas: React.FC<Props> = ({ vendas, label }) => {
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
        <FaShoppingCart />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {vendas}
        </p>
      </div>
    </div>
  );
};

export default CardVendas;
