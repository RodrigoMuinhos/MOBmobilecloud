// frontend/src/features/vendas/novavenda/views/NovaVendaDesktopView.tsx
'use client';
import React from 'react';

// Aqui mantenha **seu layout desktop original** (tabelas, colunas, etc.)
// Pode ser exatamente como era antes.
type Props = {
  t: any;
  temaAtual: any;
  onAbrirFluxo: () => void;
};

const NovaVendaDesktopView: React.FC<Props> = ({ t, temaAtual, onAbrirFluxo }) => {
  return (
    <div
      className="p-6 min-h-screen flex flex-col items-center justify-center space-y-4"
      style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
    >
      <h1 className="text-2xl font-bold" style={{ color: temaAtual.destaque }}>
        {t.novaVenda || 'Nova Venda'}
      </h1>

      <button
        onClick={onAbrirFluxo}
        className="px-6 py-3 rounded font-semibold text-lg shadow transition"
        style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
      >
        ➕ {t.abrirFluxo || 'Iniciar Venda'}
      </button>
    </div>
  );
};

export default NovaVendaDesktopView;
