import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

const ThemeSelector: React.FC = () => {
  const { setTemaSelecionado, temaSelecionado } = useTheme();

  const temasDisponiveis: ('classic' | 'dark' | 'cyber')[] = [
    'classic',
    'dark',
    'cyber',
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {temasDisponiveis.map((tema) => {
        const gradiente =
          tema === 'classic'
            ? ['#fbbf24', '#f59e0b']
            : tema === 'dark'
            ? ['#1f2937', '#111827']
            : ['#ec4899', '#8b5cf6'];

        return (
          <button
            key={tema}
            onClick={() => setTemaSelecionado(tema)}
            className={`p-4 rounded shadow-md text-white font-bold capitalize transition cursor-pointer ${
              temaSelecionado === tema ? 'ring-4 ring-orange-500' : ''
            }`}
            style={{
              background: `linear-gradient(to right, ${gradiente[0]}, ${gradiente[1]})`,
            }}
          >
            {tema}
          </button>
        );
      })}
    </div>
  );
};

export default ThemeSelector;
