'use client';
import React, { useEffect, useState } from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import { carregarBanco } from '../../data/bancoLocal';
import { EstoqueBanco } from '../../types/banco';

interface Props {
  label: string;
}

const CardEstoque: React.FC<Props> = ({ label }) => {
  const { temaAtual } = useTheme();
  const [totalCaixas, setTotalCaixas] = useState<number>(0);
  const [totalUnidades, setTotalUnidades] = useState<number>(0);

  useEffect(() => {
    try {
      const banco = carregarBanco();
      const estoqueBanco: EstoqueBanco = banco.estoque || {};

      let caixas = 0;
      let unidades = 0;

      Object.entries(estoqueBanco).forEach(([marca, modelos]) => {
        Object.values(modelos).forEach((itens) => {
          itens.forEach((item) => {
            const c = Number(item?.caixas ?? 0);
            const u = Number(item?.unidades_por_caixa ?? 0);
            caixas += c;
            unidades += c * u;
          });
        });
      });

      setTotalCaixas(caixas);
      setTotalUnidades(unidades);
    } catch (error) {
      console.error('Erro ao calcular o estoque:', error);
    }
  }, []);

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
        <FaBoxOpen />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {totalCaixas.toLocaleString()} caixas
        </p>
        <p className="text-xs text-gray-400" style={{ color: temaAtual.texto }}>
          {totalUnidades.toLocaleString()} un.
        </p>
      </div>
    </div>
  );
};

export default CardEstoque;
