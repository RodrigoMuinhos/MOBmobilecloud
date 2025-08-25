// src/components/ResumoCard.tsx
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

type Props = {
  icon: React.ReactNode;
  label: string;
  value: string;
};

const ResumoCard: React.FC<Props> = ({ icon, label, value }) => {
  const { temaAtual } = useTheme();

  return (
    <div
      className="flex flex-col items-start p-4 rounded-lg shadow-md border transition-all"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
        borderWidth: '1px',
      }}
    >
      <div className="text-xl mb-2" style={{ color: temaAtual.destaque }}>
        {icon}
      </div>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-lg font-bold">{value}</div>
    </div>
  );
};

export default ResumoCard;
