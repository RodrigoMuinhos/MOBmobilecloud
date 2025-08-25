'use client';
import React from 'react';
import { FaTrash, FaEdit, FaCheck } from 'react-icons/fa';
import { useTheme } from '../../../context/ThemeContext';

type Simulacao = {
  id: string;
  nome: string;
  studio: string;
  cpfCnpj: string;
  endereco: string;
  tipo: 'Consignado' | 'Pré-venda';
  valorInvestido: number;
  data: string;
};

type Props = {
  simulacao: Simulacao;
  onSelecionar: () => void;
  onRemover: () => void;
  onEditar: (simulacao: Simulacao) => void;
};

const CardSimulacaoAtacado: React.FC<Props> = ({ simulacao, onSelecionar, onRemover, onEditar }) => {
  const { temaAtual } = useTheme();
  const cor = simulacao.tipo === 'Consignado' ? '#f97316' : '#22c55e'; // laranja / verde

  return (
    <div
      className="rounded-lg shadow p-4 transition-all cursor-pointer hover:scale-[1.02]"
      style={{
        background: temaAtual.card,
        color: temaAtual.texto,
        borderLeft: `6px solid ${cor}`,
      }}
      onClick={onSelecionar}
    >
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">{simulacao.nome}</h3>
          <p className="text-sm opacity-80">{simulacao.studio}</p>
          <p className="text-sm opacity-70">{simulacao.endereco}</p>
          <p className="text-sm mt-1">
            <span className="font-medium">Tipo:</span> {simulacao.tipo}
          </p>
          <p className="text-sm">
            <span className="font-medium">Valor Investido:</span> R$ {simulacao.valorInvestido.toFixed(2)}
          </p>
          <p className="text-xs mt-1 text-gray-400 dark:text-gray-300">Data: {simulacao.data}</p>
        </div>

        {/* Ações */}
        <div className="flex flex-col gap-2 text-sm">
          <button onClick={(e) => { e.stopPropagation(); onEditar(simulacao); }} className="text-blue-500 hover:text-blue-700">
            <FaEdit />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onRemover(); }} className="text-red-500 hover:text-red-700">
            <FaTrash />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CardSimulacaoAtacado;