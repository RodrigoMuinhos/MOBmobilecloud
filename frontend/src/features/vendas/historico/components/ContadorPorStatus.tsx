'use client';
import React from 'react';
import { BsCircleFill } from 'react-icons/bs';

export const cores = ['azul', 'verde', 'amarelo', 'vermelho', 'roxo', 'cinza'] as const;
export type CorStatus = typeof cores[number];

const classesCor: Record<CorStatus, string> = {
  azul: 'text-blue-500',
  verde: 'text-green-500',
  amarelo: 'text-yellow-400',
  vermelho: 'text-red-500',
  roxo: 'text-purple-500',
  cinza: 'text-gray-400',
};

interface Props {
  contador: Partial<Record<CorStatus, number>>;
}

const ContadorPorStatus: React.FC<Props> = ({ contador }) => {
  return (
    <div className="flex flex-wrap gap-4 mb-4">
      {cores.map((cor) => (
        <div key={cor} className="flex items-center gap-1" aria-label={`Status ${cor}`}>
          <BsCircleFill className={classesCor[cor]} size={14} />
          <span className="text-sm">{contador[cor] ?? 0}</span>
        </div>
      ))}
    </div>
  );
};

export default ContadorPorStatus;
