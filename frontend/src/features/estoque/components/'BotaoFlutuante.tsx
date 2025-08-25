'use client';
import React from 'react';

type Props = {
  label: string;
  onClick: () => void;
  tema: any;
  className?: string; // opcional pra ajustes finos
};

const BotaoFlutuante: React.FC<Props> = ({ label, onClick, tema, className }) => (
  <button
    onClick={onClick}
    className={`absolute top-4 left-4 px-3 py-1 rounded-md text-sm shadow transition 
      ${className || ''}`}
    style={{
      backgroundColor: tema.acento ?? '#2e7d32',
      color: tema.fundo ?? '#fff',
      border: `1px solid ${tema.destaque}`,
    }}
  >
    {label}
  </button>
);

export default BotaoFlutuante;
