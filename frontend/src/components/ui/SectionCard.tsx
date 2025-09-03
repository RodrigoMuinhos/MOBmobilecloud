'use client';
import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const SectionCard: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ className = '', children }) => {
  const { temaAtual } = useTheme();
  return (
    <section
      className={`rounded-2xl p-4 md:p-5 shadow ${className}`}
      style={{ background: temaAtual.card, border: `1px solid ${temaAtual.contraste}` }}
    >
      {children}
    </section>
  );
};
