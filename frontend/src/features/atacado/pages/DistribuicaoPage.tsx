'use client';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import CardAdicionarDistribuidor from '../components/CardAdicionarDistribuidor';

const DistribuicaoPage = () => {
  const { temaAtual } = useTheme();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6" style={{ color: temaAtual.destaque }}>
        Distribuição de Produtos
      </h1>

      <CardAdicionarDistribuidor />
    </div>
  );
};

export default DistribuicaoPage;