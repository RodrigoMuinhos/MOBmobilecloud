'use client';
import React from 'react';
import { FaUsers } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  clientes: number; // CPFs únicos (clientes ativos)
  total: number;    // Total de registros no banco
  label: string;    // Título do card (ex: "Clientes Ativos")
}

const CardClientes: React.FC<Props> = ({ clientes, total, label }) => {
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
      {/* Ícone do card */}
      <div className="text-3xl" style={{ color: temaAtual.destaque }}>
        <FaUsers />
      </div>

      {/* Texto do card */}
      <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {clientes} CPF{clientes !== 1 ? 's' : ''}
        </p>
        <p className="text-xs text-gray-400" style={{ color: temaAtual.texto }}>
          {total} total
        </p>
      </div>
    </div>
  );
};

export default CardClientes;
