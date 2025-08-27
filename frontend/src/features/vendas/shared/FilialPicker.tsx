// src/features/shared/FilialPicker.tsx
'use client';
import React, { useEffect, useState } from 'react';
import api from '../../../services/api';

type Filial = { id: string; nome: string; uf: string };
type Props = {
  value?: string | null;
  onChange: (filialId: string) => void;
  className?: string;
};

const FilialPicker: React.FC<Props> = ({ value, onChange, className }) => {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/filiais');
        setFiliais(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error('Erro ao carregar filiais:', e);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  return (
    <select
      className={className || 'border p-2 rounded'}
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      disabled={carregando}
      title="Selecione a filial desta venda"
    >
      <option value="">Selecione a filial…</option>
      {filiais.map((f) => (
        <option key={f.id} value={f.id}>
          {f.nome} ({f.uf})
        </option>
      ))}
    </select>
  );
};

export default FilialPicker;
