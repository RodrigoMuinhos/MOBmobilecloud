'use client';
import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import CardMembroExtra from '../components/CardMembroExtra';
import api from '../../../services/api';

export type MembroExtra = {
  id: string;
  nome: string;
  avatar: string;
  usos: number;
  comissao: number;
  salvo: boolean;
  cargo?: string;
};

const EquipeConfigPage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].equipe;

  const [membrosExtras, setMembrosExtras] = useState<MembroExtra[]>([]);
  const [historico, setHistorico] = useState<any[]>([]);

  const getConquista = (usos: number) => {
    if (usos >= 50) return { nome: t.conquistas.elite, icon: '👑' };
    if (usos >= 30) return { nome: t.conquistas.destaque, icon: '🏆' };
    if (usos >= 10) return { nome: t.conquistas.iniciante, icon: '🥉' };
    return null;
  };

  const salvarMembroExtra = async (id: string) => {
    const membro = membrosExtras.find((m) => m.id === id);
    if (!membro) return;

    const payload = {
      nome: membro.nome,
      avatar: membro.avatar ?? null,
      usos: membro.usos ?? 0,
      comissao: membro.comissao ?? 0,
      salvo: true,
      cargo: membro.cargo ?? null,
      ...(membro.salvo && { id: membro.id }),
    };

    try {
      const response = await api.post('/membros', payload);
      console.log('✅ Membro salvo:', response.data);

      const atualizados = membrosExtras.map((m) =>
        m.id === id ? { ...response.data, salvo: true } : m
      );
      setMembrosExtras(atualizados);
    } catch (err: any) {
      console.error('❌ Erro ao salvar membro:', {
        message: err?.response?.data?.error || err?.message,
        status: err?.response?.status,
        data: err?.response?.data,
      });
      alert('Erro ao salvar membro. Veja o console para mais detalhes.');
    }
  };

  const carregarMembros = async () => {
    try {
      const vendasResponse = await api.get('/vendas');
      const vendas = vendasResponse.data;
      const membrosResponse = await api.get('/membros');
      const extrasSalvos: MembroExtra[] = membrosResponse.data;

      const membrosMap: Record<string, MembroExtra> = {};
      extrasSalvos.forEach((m) => {
        membrosMap[m.id] = {
          ...m,
          usos: 0,
          comissao: 0,
          salvo: true,
        };
      });

      vendas.forEach((venda: any) => {
        const { destinoDesconto, descontoPercentual, totalFinal } = venda;
        const perc =
          descontoPercentual === 10
            ? 0.02
            : descontoPercentual === 5
            ? 0.025
            : 0.03;

        if (destinoDesconto && destinoDesconto in membrosMap) {
          membrosMap[destinoDesconto].usos += 1;
          membrosMap[destinoDesconto].comissao += totalFinal * perc;
        }
      });

      setMembrosExtras(Object.values(membrosMap));
      setHistorico([...vendas].reverse().slice(0, 20));
    } catch (error) {
      console.error('Erro ao carregar membros ou vendas:', error);
    }
  };

  const adicionarMembro = () => {
    const novo: MembroExtra = {
      id: crypto.randomUUID(),
      nome: t.novoMembro,
      avatar: '/avatars/default.png',
      usos: 0,
      comissao: 0,
      salvo: false,
      cargo: '',
    };
    setMembrosExtras([...membrosExtras, novo]);
  };

  const atualizarMembro = async (
    id: string,
    field: keyof MembroExtra,
    value: any
  ) => {
    const atualizados = membrosExtras.map((m) =>
      m.id === id ? { ...m, [field]: value } : m
    );
    setMembrosExtras(atualizados);

    const membroAtualizado = atualizados.find((m) => m.id === id);
    if (membroAtualizado && membroAtualizado.salvo) {
      try {
        await api.put(`/membros/${id}`, membroAtualizado);
      } catch (error) {
        console.error('Erro ao atualizar membro:', error);
      }
    }
  };

  const removerMembro = async (id: string) => {
    const membro = membrosExtras.find((m) => m.id === id);
    if (membro?.salvo) {
      try {
        await api.delete(`/membros/${id}`);
      } catch (error) {
        console.error('Erro ao remover membro:', error);
      }
    }
    setMembrosExtras(membrosExtras.filter((m) => m.id !== id));
  };

  useEffect(() => {
    carregarMembros();
  }, []);

  return (
    <div
      className="p-6 space-y-6"
      style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}
    >
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{t.titulo}</h1>
        <button
          onClick={adicionarMembro}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          + {t.adicionarMembro}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {membrosExtras.map((m) => (
          <CardMembroExtra
            key={m.id}
            id={m.id}
            nome={m.nome}
            avatar={m.avatar}
            usos={m.usos}
            comissao={m.comissao}
            credito={m.comissao}
            conquista={getConquista(m.usos)}
            onUpdate={atualizarMembro}
            onRemove={removerMembro}
            onSalvar={salvarMembroExtra}
            salvo={m.salvo}
            cargo={m.cargo}
          />
        ))}
      </div>
    </div>
  );
};

export default EquipeConfigPage;
