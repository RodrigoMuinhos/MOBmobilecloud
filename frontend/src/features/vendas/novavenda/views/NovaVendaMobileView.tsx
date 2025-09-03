// frontend/src/features/vendas/novavenda/views/NovaVendaMobileView.tsx
'use client';
import React from 'react';
import AppShell from '../../../../components/layout/AppShell';
import { PageHeader } from '../../../../components/ui/PageHeader';
import { SectionCard } from '../../../../components/ui/SectionCard';

type Props = {
  t: any;
  temaAtual: any;
  onAbrirFluxo: () => void;
};

const NovaVendaMobileView: React.FC<Props> = ({ t, temaAtual, onAbrirFluxo }) => {
  return (
    <AppShell>
      <PageHeader title={t.novaVenda || 'Nova Venda'} />
      <div className="mx-auto w-full max-w-lg">
        <SectionCard>
          <div className="flex flex-col items-center text-center gap-3">
            <p className="opacity-80">
              {'Inicie uma nova venda e finalize em poucos passos.'}
            </p>
            <button
              onClick={onAbrirFluxo}
              className="w-full px-6 py-3 rounded-lg font-semibold text-base shadow transition hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: temaAtual.destaque, color: temaAtual.textoBranco }}
            >
              ➕ {t.abrirFluxo || 'Iniciar Venda'}
            </button>
          </div>
        </SectionCard>
      </div>
    </AppShell>
  );
};

export default NovaVendaMobileView;
