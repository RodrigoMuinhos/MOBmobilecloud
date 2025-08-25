'use client';
import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  titulo: string; // já vem traduzido
  valor: string | number;
  icone: React.ReactNode;
  cor?: string; // opcional, apenas para cor do ícone
};

const ResumoCard: React.FC<Props> = ({ titulo, valor, icone, cor }) => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const idioma = textos[currentLang]; // disponível para uso futuro

  // 🔍 Indicador visual no console
  console.log('[ResumoCard DASHBOARD] renderizado com título:', titulo);

  return (
    <div
      className="relative rounded-lg p-4 shadow-md flex items-center justify-between border backdrop-blur-md bg-opacity-60 transition-all duration-300 min-w-0"
      style={{
        background: temaAtual.cardGradient || temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
      }}
      aria-label={`Card de resumo: ${titulo}`}
    >
      <div>
        <h3 className="text-sm font-semibold truncate">{titulo}</h3>
        <p className="text-xl font-bold">{String(valor)}</p>
      </div>
      <div className="ml-4 text-2xl flex-shrink-0" style={{ color: cor || temaAtual.contraste }}>
        {icone}
      </div>

      {/* 🔖 Marca visual para identificação */}
      <span
        className="absolute top-0 right-0 bg-green-500 text-white text-[10px] px-1 py-[1px] rounded-bl"
        style={{ fontWeight: 'bold' }}
      >
        DASHBOARD
      </span>
    </div>
  );
};

export default ResumoCard;
