'use client';
import React from 'react';
import { FaDollarSign, FaUsers, FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  totalClientes: number;
  totalVendas: number;
  totalReceita: number;
}

const ResumoVendasPF: React.FC<Props> = ({
  totalClientes,
  totalVendas,
  totalReceita,
}) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang]?.vendas || {};

  const cards = [
    {
      icone: <FaUsers size={20} />,
      valor: totalClientes,
      titulo: idioma.totalClientes || 'Clientes únicos',
    },
    {
      icone: <FaShoppingCart size={20} />,
      valor: totalVendas,
      titulo: idioma.totalVendas || 'Total de Vendas',
    },
    {
      icone: <FaDollarSign size={20} />,
      valor: `R$ ${totalReceita.toFixed(2)}`,
      titulo: idioma.totalReceita || 'Receita Total',
    },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-4 rounded shadow w-full md:w-auto"
          style={{
            background: temaAtual.card,
            color: temaAtual.texto,
            border: `1px solid ${temaAtual.contraste}`,
          }}
        >
          <div>{card.icone}</div>
          <div>
            <p className="text-sm">{card.titulo}</p>
            <p className="text-lg font-semibold">{card.valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumoVendasPF;
