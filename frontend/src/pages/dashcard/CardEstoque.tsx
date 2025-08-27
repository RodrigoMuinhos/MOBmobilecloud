// src/pages/dashcard/CardEstoque.tsx  (ajuste o caminho se for diferente)
'use client';
import React, { useEffect, useState } from 'react';
import { FaBoxOpen } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

interface Props {
  label: string;
  filialId?: string; // opcional: permite forçar a filial a partir do Dashboard
}

// Tipo mínimo esperado da sua API /produtoestoque
type ProdutoEstoqueAPI = {
  id: string;
  nome: string;
  marca: string | null;
  tipo: string | null;
  caixas: number | null;
  unidades_por_caixa: number | null;
};

const CardEstoque: React.FC<Props> = ({ label, filialId }) => {
  const { temaAtual } = useTheme();

  const [totalCaixas, setTotalCaixas] = useState(0);
  const [totalUnidades, setTotalUnidades] = useState(0);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregarEstoque = async () => {
      try {
        setCarregando(true);
        // pega da prop ou do localStorage
        const filial = filialId ?? localStorage.getItem('filialId') ?? '';

        const resp = await api.get<ProdutoEstoqueAPI[]>('/produtoestoque', {
          params: filial ? { filialId: filial } : undefined,
        });

        const lista = Array.isArray(resp.data) ? resp.data : [];

        let caixas = 0;
        let unidades = 0;

        for (const item of lista) {
          const c = Number(item.caixas ?? 0) || 0;
          const u = Number(item.unidades_por_caixa ?? 1) || 1;
          caixas += c;
          unidades += c * u;
        }

        setTotalCaixas(caixas);
        setTotalUnidades(unidades);
      } catch (e) {
        console.error('Erro ao carregar estoque:', e);
        setTotalCaixas(0);
        setTotalUnidades(0);
      } finally {
        setCarregando(false);
      }
    };

    carregarEstoque();
  }, [filialId]);

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
        <FaBoxOpen />
      </div>

      <div>
        <p className="text-sm text-gray-400">{label}</p>

        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {carregando ? '—' : `${totalCaixas.toLocaleString()} caixas`}
        </p>

        <p className="text-xs text-gray-400" style={{ color: temaAtual.texto }}>
          {carregando ? '—' : `${totalUnidades.toLocaleString()} un.`}
        </p>
      </div>
    </div>
  );
};

export default CardEstoque;
