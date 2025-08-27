// src/features/estoque/pages/VisaoEstoquePage.tsx
'use client';
import React, { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaCubes, FaBoxOpen } from 'react-icons/fa';
import ResumoCard from '../../../components/ResumoCard';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';

// Tipos mínimos
interface ProdutoEstoqueAPI {
  id: string;
  codigo: string;
  nome: string;
  tipo: string | null;
  marca: string | null;
  preco_venda_unidade: number | null;
  preco_venda_caixa: number | null;
  unidades_por_caixa: number | null;
  caixas: number | null;
  estoqueId?: string;
  filialId?: string | null;
  // legado opcional
  preco_caixa?: number | null;
}

type FilialAPI = { id: string; nome: string; uf?: string | null; cidade?: string | null };

const VisaoEstoquePage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].estoque;

  const [filiais, setFiliais] = useState<FilialAPI[]>([]);
  const [filialSelecionada, setFilialSelecionada] = useState<string>(''); // '' = todas

  const [resumoPorMarca, setResumoPorMarca] = useState<{ nome: string; pago: number }[]>([]);
  const [graficoPorTipo, setGraficoPorTipo] = useState<any[]>([]);
  const [graficoTop5, setGraficoTop5] = useState<any[]>([]);
  const [totais, setTotais] = useState({ caixas: 0, unidades: 0 });

  // ---- carregar filiais (para o select) ----
  useEffect(() => {
    const carregarFiliais = async () => {
      try {
        // ajuste a rota se necessário: '/filiais' -> '/filial'
        const resp = await api.get('/filiais');
        const lista: FilialAPI[] = Array.isArray(resp.data) ? resp.data : [];
        setFiliais(lista);

        // restaura última seleção do usuário
        const salvo = localStorage.getItem('filialId') || '';
        // garante que exista na lista; se não existir, volta para "todas"
        if (salvo && lista.some(f => f.id === salvo)) {
          setFilialSelecionada(salvo);
        } else {
          setFilialSelecionada(''); // todas
          localStorage.removeItem('filialId');
        }
      } catch (e) {
        console.error('Erro ao carregar filiais:', e);
      }
    };
    carregarFiliais();
  }, []);

  // ---- carregar estoque (depende da filial selecionada) ----
  const carregarEstoque = useCallback(async (filialId: string) => {
    try {
      const params = filialId ? { filialId } : undefined;
      const response = await api.get('/produtoestoque', { params }); // rota já existia
      const lista: ProdutoEstoqueAPI[] = Array.isArray(response.data) ? response.data : [];

      const marcasMap = new Map<string, number>();
      const tipos: Record<string, Record<string, number>> = {};
      const produtos: Record<string, number> = {};
      let totalCaixas = 0;
      let totalUnidades = 0;

      lista.forEach((item) => {
        const marca = (item.marca || 'Desconhecido').toUpperCase();
        const tipo = item.tipo || 'Geral';

        const caixas = Number(item.caixas ?? 0) || 0;
        const unidadesCaixa = Number(item.unidades_por_caixa ?? 1) || 1;

        const base = (item.preco_caixa ?? item.preco_venda_caixa);
        const precoBase = Number(base ?? 0);
        const precoUnidade = Number(item.preco_venda_unidade ?? 0);

        const preco = (Number.isFinite(precoBase) && precoBase > 0)
          ? precoBase
          : (Number.isFinite(precoUnidade) ? precoUnidade * unidadesCaixa : 0);

        totalCaixas += caixas;
        totalUnidades += caixas * unidadesCaixa;

        // Valor total por marca
        marcasMap.set(marca, (marcasMap.get(marca) || 0) + (caixas * preco));

        // Caixas por tipo/marca
        if (!tipos[tipo]) tipos[tipo] = {};
        tipos[tipo][marca] = (tipos[tipo][marca] || 0) + caixas;

        // Top 5 produtos (por caixas)
        const nomeProduto = item.nome || 'Sem nome';
        produtos[nomeProduto] = (produtos[nomeProduto] || 0) + caixas;
      });

      setResumoPorMarca(
        Array.from(marcasMap.entries()).map(([nome, pago]) => ({ nome, pago }))
      );

      setGraficoPorTipo(
        Object.entries(tipos).map(([tipo, valores]) => ({
          tipo,
          ...valores,
        }))
      );

      setGraficoTop5(
        Object.entries(produtos)
          .map(([nome, caixas]) => ({ nome, caixas }))
          .sort((a, b) => b.caixas - a.caixas)
          .slice(0, 5)
      );

      setTotais({ caixas: totalCaixas, unidades: totalUnidades });
    } catch (error) {
      console.error('Erro ao carregar estoque:', error);
    }
  }, []);

  useEffect(() => {
    // salva/restaura preferências e recarrega dados ao trocar filial
    if (filialSelecionada) {
      localStorage.setItem('filialId', filialSelecionada);
    } else {
      localStorage.removeItem('filialId');
    }
    carregarEstoque(filialSelecionada);
  }, [filialSelecionada, carregarEstoque]);

  const cores = [temaAtual.destaque, temaAtual.contraste || '#B22222'];

  return (
    <div className="p-6 space-y-10" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      {/* Cabeçalho + Select de Filial */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
        <h1 className="text-2xl font-bold" style={{ color: temaAtual.destaque }}>
          {t.visaoEstoque} - MOB Supply
        </h1>

        {/* SELECT ÚNICO — segue as cores do tema */}
        <label className="flex items-center gap-2">
          <span className="text-sm opacity-80">Filial:</span>
          <select
            value={filialSelecionada}
            onChange={(e) => setFilialSelecionada(e.target.value)}
            className="rounded-md px-3 py-2 text-sm outline-none"
            style={{
              backgroundColor: temaAtual.card,
              color: temaAtual.texto,
              border: `1px solid ${temaAtual.texto || '#e5e7eb'}`,
              boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            }}
          >
            <option value="">Todas as filiais</option>
            {filiais.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}{f.uf ? ` - ${f.uf}` : ''}{f.cidade ? ` / ${f.cidade}` : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Cards de resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resumoPorMarca.map((m) => (
          <ResumoCard
            key={m.nome}
            icon={<FaBoxOpen />}
            label={`${m.nome} - Valor`}
            value={`R$ ${m.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
        ))}
        <ResumoCard icon={<FaCubes />} label={t.totalCaixas} value={`${totais.caixas.toLocaleString()} caixas`} />
        <ResumoCard icon={<FaCubes />} label={t.totalUnidades} value={`${totais.unidades.toLocaleString()} unidades`} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GraficoBox titulo={t.caixasValor}>
          <LineChart data={resumoPorMarca.map((m) => ({ marca: m.nome, pago: m.pago }))}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="marca" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="pago" stroke={temaAtual.contraste || '#B22222'} />
          </LineChart>
        </GraficoBox>

        <GraficoBox titulo={t.proporcaoCaixas}>
          <PieChart>
            <Pie
              data={resumoPorMarca.map((m) => ({ nome: m.nome, value: m.pago }))}
              dataKey="value"
              nameKey="nome"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {resumoPorMarca.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </GraficoBox>

        <GraficoBox titulo={t.caixasPorSub}>
          <BarChart data={graficoPorTipo}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="tipo" />
            <YAxis />
            <Tooltip />
            <Legend />
            {resumoPorMarca.map((m, i) => (
              <Bar key={m.nome} dataKey={m.nome} fill={cores[i % cores.length]} />
            ))}
          </BarChart>
        </GraficoBox>

        <GraficoBox titulo="Top 5 Produtos Mais Estocados">
          <BarChart data={graficoTop5}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="caixas" fill={temaAtual.destaque} />
          </BarChart>
        </GraficoBox>
      </div>
    </div>
  );
};

const GraficoBox: React.FC<{ titulo: string; children: React.ReactElement }> = ({ titulo, children }) => {
  const { temaAtual } = useTheme();
  return (
    <div className="p-4 rounded shadow" style={{ backgroundColor: temaAtual.card }}>
      <h2 className="text-lg font-bold mb-2" style={{ color: temaAtual.destaque }}>{titulo}</h2>
      <ResponsiveContainer width="100%" height={300}>
        {children}
      </ResponsiveContainer>
    </div>
  );
};

export default VisaoEstoquePage;
