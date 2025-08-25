'use client';
import React from 'react';
import { ProdutoEstoqueAPI } from '../../../types/banco';
import { useTheme } from '../../../context/ThemeContext';
import { FaBoxOpen, FaCubes } from 'react-icons/fa';
import ResumoCard from './ResumoCard';

interface Props {
  estoque: ProdutoEstoqueAPI[];
}

const CardsFinanceirosEstoque: React.FC<Props> = ({ estoque }) => {
  const { temaAtual } = useTheme();

  const resumo = estoque.reduce(
    (acc, item) => {
      const marca = (item.marca || 'OUTROS').toUpperCase();
      const preco = Number(item.preco_caixa) || 0;
      const caixas = Number(item.caixas) || 0;
      const unidades = Number(item.unidades_por_caixa) || 0;
      const total = preco * caixas;

      acc.marcas[marca] = (acc.marcas[marca] || 0) + total;
      acc.totalCaixas += caixas;
      acc.totalUnidades += caixas * unidades;

      return acc;
    },
    {
      marcas: {} as Record<string, number>,
      totalCaixas: 0,
      totalUnidades: 0,
    }
  );

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {Object.entries(resumo.marcas).map(([marca, valor]) => (
        <ResumoCard
          key={marca}
          icon={<FaBoxOpen color={temaAtual.destaque} />}
          label={`${marca} - Pago`}
          value={`R$ ${valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
        />
      ))}

      <ResumoCard
        icon={<FaCubes color={temaAtual.destaque} />}
        label="Total de Caixas"
        value={`${resumo.totalCaixas.toLocaleString()} caixas`}
      />

      <ResumoCard
        icon={<FaCubes color={temaAtual.destaque} />}
        label="Total de Unidades"
        value={`${resumo.totalUnidades.toLocaleString()} unidades`}
      />
    </div>
  );
};

export default CardsFinanceirosEstoque;
