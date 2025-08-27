// src/pages/dashcard/CardVendas.tsx  (ajuste o caminho se preciso)
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { FaShoppingCart } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

interface Props {
  label: string;
  filialId?: string;           // opcional: força uma filial específica
  auto?: boolean;              // default: true -> busca na API; false -> usa a prop vendas
  vendas?: number;             // usado quando auto === false
  statusPagamento?: string;    // opcional: ex. 'pago' | 'aberto' (se existir na API)
  dataInicio?: string;         // opcional: 'YYYY-MM-DD' para filtragem no client
  dataFim?: string;            // opcional: 'YYYY-MM-DD'
}

type VendaAPI = {
  id?: string;
  filialId?: string | null;
  status_pagamento?: string | null;
  dataVenda?: string | null;   // 'YYYY-MM-DD' ou ISO
};

const CardVendas: React.FC<Props> = ({
  label,
  filialId,
  auto = true,
  vendas: vendasProp,
  statusPagamento,
  dataInicio,
  dataFim,
}) => {
  const { temaAtual } = useTheme();

  const [lista, setLista] = useState<VendaAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(auto);

  useEffect(() => {
    if (!auto) return;

    const carregar = async () => {
      try {
        setLoading(true);
        const filial = filialId ?? localStorage.getItem('filialId') ?? '';
        const resp = await api.get<VendaAPI[]>('/vendas', {
          params: filial ? { filialId: filial } : undefined,
        });
        setLista(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error('Erro ao carregar vendas:', e);
        setLista([]);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [auto, filialId]);

  const qtdVendasApi = useMemo(() => {
    if (!auto) return 0;

    const dentroDoPeriodo = (d?: string | null) => {
      if (!d) return true;
      const x = new Date(d.split('T')[0] ?? d);
      if (dataInicio && x < new Date(dataInicio)) return false;
      if (dataFim && x > new Date(dataFim)) return false;
      return true;
    };

    return lista.filter((v) => {
      const okStatus = statusPagamento ? v.status_pagamento === statusPagamento : true;
      const okData = dentroDoPeriodo(v.dataVenda ?? null);
      return okStatus && okData;
    }).length;
  }, [auto, lista, statusPagamento, dataInicio, dataFim]);

  const valorExibido = auto ? (loading ? undefined : qtdVendasApi) : vendasProp;

  return (
    <div
      className="relative rounded-lg shadow-md p-5 flex items-center gap-4 border-l-4 transition-all duration-300"
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
        borderColor: temaAtual.destaque,
      }}
    >
      <div className="text-3xl" style={{ color: temaAtual.destaque }}>
        <FaShoppingCart />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {valorExibido === undefined ? '—' : valorExibido}
        </p>
      </div>
    </div>
  );
};

export default CardVendas;
