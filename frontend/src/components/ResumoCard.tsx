'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ResumoCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

const ResumoCard: React.FC<ResumoCardProps> = ({ icon, label, value }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage(); // disponível para uso futuro

  // 🔍 Indicador para saber se esta versão está sendo usada
  console.log('[ResumoCard CLÁSSICO] renderizado com label:', label);

  return (
    <div
      className="flex rounded shadow overflow-hidden border transition-all duration-300 relative"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
        borderWidth: '1px',
      }}
    >
      <div
        className="w-2"
        style={{ backgroundColor: temaAtual.destaque }}
      ></div>

      <div className="p-4 flex items-center space-x-4">
        <div className="text-2xl" style={{ color: temaAtual.texto }}>
          {icon}
        </div>
        <div>
          <p className="text-sm opacity-80">{label}</p>
          <p className="text-xl font-bold">{value}</p>
        </div>
      </div>

      {/* 🔖 Marca visual para identificação */}
      <span
        className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] px-1 py-[1px] rounded-bl"
        style={{ fontWeight: 'bold' }}
      >
        ESTOQUE
      </span>
    </div>
  );
};

export default ResumoCard;
