'use client';
import React from 'react';
import { useTheme } from '../context/ThemeContext';

interface CardProps {
  title: string;
  children: React.ReactNode;
  id?: string; // opcional para ancoragem
}

const Card: React.FC<CardProps> = ({ title, children, id }) => {
  const { temaAtual } = useTheme();

  return (
    <div
      className="rounded-lg shadow-md p-4 border transition-all duration-300 min-w-0 overflow-hidden"
      style={{
        backgroundColor: temaAtual.card || '#ffffff',
        color: temaAtual.texto || '#000000',
        borderColor: temaAtual.destaque || '#cccccc',
        borderWidth: '1px',
      }}
      aria-label={`Card: ${title}`}
    >
      <h2
        className="text-lg font-bold mb-2 truncate"
        id={id}
        style={{ color: temaAtual.texto }}
      >
        {title}
      </h2>
      {children}
    </div>
  );
};

export default Card;
