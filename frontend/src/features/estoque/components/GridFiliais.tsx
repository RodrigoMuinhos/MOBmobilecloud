// src/features/estoque/components/GridFiliais.tsx
'use client';
import React from 'react';
import type { FilialAPI } from './AbasFiliais';

const GridFiliais: React.FC<{
  filiais: FilialAPI[];
  onSelect: (id: string) => void;
}> = ({ filiais, onSelect }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Locais de Estoque</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {filiais.map((f) => (
          <button
            key={f.id}
            onClick={() => onSelect(f.id)}
            className="border rounded-2xl p-8 text-xl font-semibold hover:shadow"
          >
            {f.cidade}-{f.estado}
          </button>
        ))}
      </div>
    </div>
  );
};

export default GridFiliais;
