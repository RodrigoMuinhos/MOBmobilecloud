'use client';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { EstoqueBanco, ProdutoEstoqueAPI } from '../../../types';
import { FaTags, FaBoxOpen, FaCubes, FaCashRegister } from 'react-icons/fa';

interface Props {
  estoque: EstoqueBanco;
}

const TotaisGeraisEstoque: React.FC<Props> = ({ estoque }) => {
  const { temaAtual } = useTheme();

  let totalCaixas = 0;
  let totalUnidades = 0;
  let valorTotal = 0;

  const marcas = new Set<string>();
  const modelos = new Set<string>();

  Object.entries(estoque).forEach(([marca, tipos]) => {
    marcas.add(marca.toLowerCase());

    Object.values(tipos).forEach((itens) => {
      (itens as ProdutoEstoqueAPI[]).forEach((item) => {
        const caixas = Number(item.caixas) || 0;
        const unidades = Number(item.unidades_por_caixa) || 1;

        // Aceita tanto preco_venda_caixa quanto precoCaixa
        const preco =
          Number(item.preco_venda_caixa) ??
          Number(item.precoCaixa) ??
          0;

        totalCaixas += caixas;
        totalUnidades += caixas * unidades;
        valorTotal += caixas * preco;

        if (item.nome) modelos.add(item.nome.toLowerCase());
      });
    });
  });

  const formatarMoeda = (valor: number): string =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    }).format(valor);

  return (
    <div className="mt-6" style={{ color: temaAtual.texto }}>
      <h2 className="text-lg font-bold mb-4">Totais Gerais do Estoque</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <CardInfo
          titulo="Valor Total"
          valor={formatarMoeda(valorTotal)}
          icone={<FaCashRegister size={20} color={temaAtual.destaque} />}
        />
        <CardInfo
          titulo="Total de Unidades"
          valor={`${totalUnidades} un.`}
          icone={<FaCubes size={20} color={temaAtual.destaque} />}
        />
        <CardInfo
          titulo="Marcas Cadastradas"
          valor={`${marcas.size} marca${marcas.size !== 1 ? 's' : ''}`}
          icone={<FaTags size={20} color={temaAtual.destaque} />}
        />
        <CardInfo
          titulo="Modelos Cadastrados"
          valor={`${modelos.size} modelo${modelos.size !== 1 ? 's' : ''}`}
          icone={<FaBoxOpen size={20} color={temaAtual.destaque} />}
        />
      </div>
    </div>
  );
};

interface CardInfoProps {
  titulo: string;
  valor: string;
  icone: React.ReactNode;
}

const CardInfo: React.FC<CardInfoProps> = ({ titulo, valor, icone }) => {
  const { temaAtual } = useTheme();
  return (
    <div
      className="p-4 rounded-md border flex flex-col gap-2 shadow-md"
      style={{
        borderColor: temaAtual.destaque,
        backgroundColor: temaAtual.card,
      }}
    >
      <div className="flex items-center gap-2">
        {icone}
        <p className="text-sm">{titulo}</p>
      </div>
      <p className="font-bold text-xl">{valor}</p>
    </div>
  );
};

export default TotaisGeraisEstoque;
