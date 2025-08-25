import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  total: number;
  totalCidades: number;
  totalUFs: number;
};

const ResumoCards: React.FC<Props> = ({ total, totalCidades, totalUFs }) => {
  const { temaAtual } = useTheme();

  const estiloCard: React.CSSProperties = {
    background: temaAtual.cardGradient || temaAtual.card,
    color: temaAtual.texto,
    border: `1px solid ${temaAtual.destaque}`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  const cards = [
    { titulo: 'Total de Registros', valor: total },
    { titulo: 'Cidades Únicas', valor: totalCidades },
    { titulo: 'UFs Únicas', valor: totalUFs },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
      {cards.map((card) => (
        <div
          key={card.titulo}
          className="p-4 rounded shadow text-center"
          style={estiloCard}
        >
          <h2 className="text-lg font-semibold">{card.titulo}</h2>
          <p className="text-3xl font-bold mt-2">{card.valor}</p>
        </div>
      ))}
    </div>
  );
};

export default ResumoCards;
