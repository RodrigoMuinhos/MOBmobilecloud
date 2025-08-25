'use client';
import React, { useEffect, useMemo, useRef } from 'react';

export type FilialAPI = {
  id: string;
  nome?: string | null;
  cidade?: string | null;
  uf?: string | null;
  estado?: string | null; // compat
  ativa?: boolean | null;
};

type Props = {
  filiais: FilialAPI[];
  filialIdAtiva: string;
  onTrocarFilial: (id: string) => void;
  tema?: any;
};

const AbasFiliais: React.FC<Props> = ({ filiais, filialIdAtiva, onTrocarFilial, tema }) => {
  const listRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  const borderColor = tema?.destaque ?? '#e5e7eb';
  const textMuted  = tema?.textoSuave ?? '#6b7280';
  const textActive = tema?.acentoTexto ?? tema?.titulo ?? '#14532d';
  const underline  = tema?.acento ?? '#16a34a';

  // label robusto
  const getLabel = (f: FilialAPI) => {
    const uf = f.uf ?? f.estado ?? '';
    const cidade = f.cidade ?? '';
    if (f.nome && f.nome.trim()) return f.nome;
    const composed = [cidade, uf].filter(Boolean).join(' - ');
    return composed || 'Sem nome';
  };

  useEffect(() => {
    activeRef.current?.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' });
  }, [filialIdAtiva]);

  const ids = useMemo(() => filiais.map(f => f.id), [filiais]);
  const handleKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (!ids.length) return;
    const idx = Math.max(0, ids.indexOf(filialIdAtiva));
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      onTrocarFilial(ids[(idx + 1) % ids.length]);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      onTrocarFilial(ids[(idx - 1 + ids.length) % ids.length]);
    }
  };

  if (!filiais.length) return null;

  return (
    <div className="relative">
      <div
        ref={listRef}
        className="flex gap-6 overflow-x-auto pb-2 scroll-smooth"
        style={{ borderBottom: `1px solid ${borderColor}` }}
        role="tablist"
        onKeyDown={handleKeyDown}
      >
        {filiais.map((f) => {
          const ativa = f.id === filialIdAtiva;
          const label = getLabel(f);

          return (
            <button
              key={f.id}
              ref={ativa ? activeRef : undefined}
              role="tab"
              aria-selected={ativa}
              title={label}
              onClick={() => onTrocarFilial(f.id)}
              className="relative whitespace-nowrap pb-2 text-lg font-semibold outline-none focus-visible:ring-2 rounded-sm transition-colors"
              style={{ color: ativa ? textActive : textMuted }}
            >
              {label}
              <span
                className="absolute left-0 bottom-0 h-1 rounded-full transition-all"
                style={{
                  width: ativa ? '100%' : 0,
                  backgroundColor: underline,
                }}
              />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default AbasFiliais;
