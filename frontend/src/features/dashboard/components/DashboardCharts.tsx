'use client';
import React, { useMemo } from 'react';
import { VendaAPI } from '../../../types/api/vendaApi.types';
import GraficosCentrais from './GraficosCentrais';

type Props = {
  vendas: VendaAPI[];
  carregando?: boolean; // opcional, pra combinar com src/pages/Dashboard.tsx
};

/**
 * Bridge de vendas para manter compatibilidade com componentes antigos:
 * - Garante que existam as chaves `dataVenda` e `totalFinal`
 *   mesmo quando a API vem com `data` / `total`
 */
function useVendasBridge(vendas: VendaAPI[]) {
  return useMemo(() => {
    return (vendas || []).map((v: any) => ({
      ...v,
      // normaliza data
      dataVenda: v?.dataVenda ?? v?.data ?? null,
      // normaliza total
      totalFinal: typeof v?.totalFinal === 'number' ? v.totalFinal : (Number(v?.total ?? 0) || 0),
    }));
  }, [vendas]);
}

const DashboardCharts: React.FC<Props> = ({ vendas, carregando = false }) => {
  const vendasBridge = useVendasBridge(vendas);

  if (carregando) {
    return (
      <div
        className="w-full h-96 rounded-lg animate-pulse"
        style={{ background: 'rgba(0,0,0,0.06)' }}
      />
    );
    // ou um spinner/skeleton custom
  }

  return (
    <div className="relative">
      <span className="absolute -top-3 right-0 bg-blue-600 text-white text-[10px] px-2 py-[1px] rounded-bl z-10 font-bold">
        GRÁFICOS DASHBOARD
      </span>

      {/* Se o GraficosCentrais ainda tipa com o tipo antigo, o cast evita erro de compilação */}
      <GraficosCentrais vendas={vendasBridge as any} />
    </div>
  );
};

export default DashboardCharts;
