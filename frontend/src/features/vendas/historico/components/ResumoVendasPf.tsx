// src/features/vendas/historico/components/ResumoVendasPf.tsx
'use client';
import React, { useMemo } from 'react';
import { FaDollarSign, FaUsers, FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';

interface Props {
  totalClientes: number;
  totalVendas: number;
  totalReceita: number;
  currency?: 'BRL' | 'USD' | 'EUR'; // opcional, default BRL
}

const ResumoVendasPF: React.FC<Props> = ({
  totalClientes,
  totalVendas,
  totalReceita,
  currency = 'BRL',
}) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang]?.vendas || {};

  // locale simples baseado no currentLang
  const locale = useMemo(() => {
    switch ((currentLang || 'pt').toLowerCase()) {
      case 'en':
        return 'en-US';
      case 'es':
        return 'es-ES';
      default:
        return 'pt-BR';
    }
  }, [currentLang]);

  const fmtInt = (n: number) =>
    new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(
      Number.isFinite(n) ? Math.max(0, Math.trunc(n)) : 0
    );

  const fmtMoney = (n: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(Number.isFinite(n) ? n : 0);

  const cards = [
    {
      key: 'clientes',
      icone: <FaUsers size={18} />,
      valor: fmtInt(totalClientes),
      titulo: idioma.totalClientes || 'Clientes únicos',
    },
    {
      key: 'vendas',
      icone: <FaShoppingCart size={18} />,
      valor: fmtInt(totalVendas),
      titulo: idioma.totalVendas || 'Total de Vendas',
    },
    {
      key: 'receita',
      icone: <FaDollarSign size={18} />,
      valor: fmtMoney(totalReceita),
      titulo: idioma.totalReceita || 'Receita Total',
    },
  ] as const;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {cards.map((card) => (
        <div
          key={card.key}
          className="flex items-center gap-3 p-4 rounded-xl shadow transition-transform"
          style={{
            background: temaAtual.card,
            color: temaAtual.texto,
            border: `1px solid ${temaAtual.contraste}`,
          }}
          aria-label={`${card.titulo}: ${card.valor}`}
        >
          <div
            className="p-2 rounded-full"
            style={{
              background: temaAtual.input,
              border: `1px solid ${temaAtual.contraste}`,
            }}
          >
            {card.icone}
          </div>
          <div>
            <p className="text-xs opacity-80">{card.titulo}</p>
            <p className="text-xl font-semibold tracking-tight">{card.valor}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ResumoVendasPF;
