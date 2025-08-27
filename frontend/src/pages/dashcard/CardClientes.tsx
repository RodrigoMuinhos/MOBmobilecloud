// src/pages/dashcard/CardClientes.tsx  (ajuste o caminho se necessário)
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

interface Props {
  label: string;
  filialId?: string;   // opcional: filtra por filial
  auto?: boolean;      // default: true -> busca na API; false -> usa props abaixo
  clientes?: number;   // usado se auto === false
  total?: number;      // usado se auto === false
}

// tipo mínimo esperado da sua API de clientes
type ClienteAPI = {
  id?: string;
  cpf: string;
  nome?: string | null;
  nascimento?: string | null;
  incompleto?: boolean | null;
  filialId?: string | null;
};

const CardClientes: React.FC<Props> = ({ label, filialId, auto = true, clientes, total }) => {
  const { temaAtual } = useTheme();

  const [lista, setLista] = useState<ClienteAPI[]>([]);
  const [loading, setLoading] = useState<boolean>(auto);

  useEffect(() => {
    if (!auto) return;

    const carregar = async () => {
      try {
        setLoading(true);
        const filial = filialId ?? localStorage.getItem('filialId') ?? '';
        const resp = await api.get<ClienteAPI[]>('/clientes', {
          params: filial ? { filialId: filial } : undefined,
        });
        setLista(Array.isArray(resp.data) ? resp.data : []);
      } catch (e) {
        console.error('Erro ao carregar clientes:', e);
        setLista([]);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, [auto, filialId]);

  // calcula ativos e total a partir da API
  const { ativosApi, totalApi } = useMemo(() => {
    if (!auto) return { ativosApi: 0, totalApi: 0 };

    const totalUnicos = new Set<string>();
    const ativosUnicos = new Set<string>();

    for (const c of lista) {
      const cpf = (c.cpf || '').trim();
      if (!cpf) continue;

      totalUnicos.add(cpf);

      // mesma regra usada no projeto: ativo = tem dados essenciais e não incompleto
      const eAtivo =
        (c.incompleto === false || c.incompleto == null) &&
        Boolean(c.nome && c.nome.trim()) &&
        Boolean(c.nascimento && String(c.nascimento).trim());

      if (eAtivo) ativosUnicos.add(cpf);
    }

    // fallback: se nenhum considerado “ativo” pelas flags, considere todos com CPF como ativos
    const ativos =
      ativosUnicos.size > 0 ? ativosUnicos.size : totalUnicos.size;

    return { ativosApi: ativos, totalApi: totalUnicos.size };
  }, [auto, lista]);

  // decide o que exibir (props x API)
  const valorAtivos = auto ? (loading ? undefined : ativosApi) : clientes;
  const valorTotal = auto ? (loading ? undefined : totalApi) : total;

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
        <FaUsers />
      </div>

      <div>
        <p className="text-sm font-medium text-gray-400">{label}</p>

        <p className="text-xl font-bold" style={{ color: temaAtual.texto }}>
          {valorAtivos === undefined ? '—' : `${valorAtivos} CPF${valorAtivos !== 1 ? 's' : ''}`}
        </p>

        <p className="text-xs text-gray-400" style={{ color: temaAtual.texto }}>
          {valorTotal === undefined ? '—' : `${valorTotal} total`}
        </p>
      </div>
    </div>
  );
};

export default CardClientes;
