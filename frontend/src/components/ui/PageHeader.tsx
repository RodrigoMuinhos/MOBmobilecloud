'use client';

import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface Props {
  title: string;
  right?: React.ReactNode;
}

export const PageHeader: React.FC<Props> = ({ title, right }) => {
  const { temaAtual } = useTheme();

  return (
    <div className="mb-4 md:mb-6 flex items-center justify-between">
      <h1
        className="text-xl md:text-2xl font-bold"
        style={{ color: temaAtual.texto }}
      >
        {title}
      </h1>
      {right}
    </div>
  );
};
