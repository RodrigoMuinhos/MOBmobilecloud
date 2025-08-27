// src/pages/dashcard/CardReceita.tsx  (ajuste o caminho se precisar)
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { FaDollarSign } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

interface Props {
  label: string;
  filialId?: string;   // opcional: força uma filial específica
  auto?: boolean;      // default: true => busca na API; false => usa a prop receita
  receita?: number;    // usado quando auto === false
}

type VendaAPI = {
  id?: string;
  filialId?: string | null;
  totalFinal?: number | null;
  total?: number | null;
  subtotal?: number | null;
  frete?: number | null;
  acrescimo?: number | null;
  descontoValor?: number | null;
  // status_pagamento?: 'pago' | 'aberto' | ...  // se quiser filtrar depois
};

const CardReceita: React.FC<Props> = ({ label, filialId, auto = true, receita }) => {
  const { temaAtual } = useTheme();

  const [vendas, setVendas] = useState<VendaAPI[]>([]);
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
        setVendas(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error('Erro ao carregar vendas:', e);
        setVendas([]);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [auto, filialId]);

  const receitaApi = useMemo(() => {
    if (!auto) return 0;
    let total = 0;
    for (const v of vendas) {
      const totalFinal = Number(v.totalFinal ?? NaN);
      const totalLegacy = Number(v.total ?? NaN);

      if (Number.isFinite(totalFinal)) {
        total += totalFinal;
        continue;
      }
      if (Number.isFinite(totalLegacy)) {
        total += totalLegacy;
        continue;
      }

      const subtotal = Number(v.subtotal ?? 0) || 0;
      const frete = Number(v.frete ?? 0) || 0;
      const acrescimo = Number(v.acrescimo ?? 0) || 0;
      const desconto = Number(v.descontoValor ?? 0) || 0;

      total += subtotal + frete + acrescimo - desconto;
    }
    return total;
  }, [auto, vendas]);

  const valor = auto ? (loading ? undefined : receitaApi) : receita;

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
        <FaDollarSign />
      </div>
      <div>
        <p className="text-sm text-gray-400">{label}</p>
        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {valor === undefined
            ? '—'
            : `R$ ${Number(valor).toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
        </p>
      </div>
    </div>
  );
};

export default CardReceita;
