'use client';
import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend, PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { FaCubes, FaBoxOpen } from 'react-icons/fa';
import ResumoCard from '../../../components/ResumoCard';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import api from '../../../services/api';
import { ProdutoEstoqueAPI } from '../../../types/banco';

const VisaoEstoquePage: React.FC = () => {
  const { temaAtual } = useTheme();
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].estoque;

  const [resumoPorMarca, setResumoPorMarca] = useState<{ nome: string, pago: number }[]>([]);
  const [graficoPorTipo, setGraficoPorTipo] = useState<any[]>([]);
  const [graficoTop5, setGraficoTop5] = useState<any[]>([]);
  const [totais, setTotais] = useState({ caixas: 0, unidades: 0 });

  useEffect(() => {
    const carregarEstoque = async () => {
      try {
        const response = await api.get('/estoque');
        const lista: ProdutoEstoqueAPI[] = response.data || [];

        const marcasMap = new Map<string, number>();
        const tipos: Record<string, any> = {};
        const produtos: Record<string, number> = {};
        let totalCaixas = 0;
        let totalUnidades = 0;

        lista.forEach((item) => {
          const marca = (item.marca || 'Desconhecido').toUpperCase();
          const tipo = item.tipo || 'Geral';
          const caixas = Number(item.caixas) || 0;
          const unidadesCaixa = Number(item.unidades_por_caixa) || 1;
          const preco = Number(item.preco_caixa) || 0;

          totalCaixas += caixas;
          totalUnidades += caixas * unidadesCaixa;

          marcasMap.set(marca, (marcasMap.get(marca) || 0) + caixas * preco);

          if (!tipos[tipo]) tipos[tipo] = {};
          tipos[tipo][marca] = (tipos[tipo][marca] || 0) + caixas;

          produtos[item.nome] = (produtos[item.nome] || 0) + caixas;
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
    };

    carregarEstoque();
  }, []);

  const cores = [temaAtual.destaque, temaAtual.contraste || '#B22222'];

  return (
    <div className="p-6 space-y-10" style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }}>
      <h1 className="text-2xl font-bold mb-4" style={{ color: temaAtual.destaque }}>
        {t.visaoEstoque} - MOB Supply
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {resumoPorMarca.map((m) => (
          <ResumoCard
            key={m.nome}
            icon={<FaBoxOpen />}
            label={`${m.nome} - Pago`}
            value={`R$ ${m.pago.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
          />
        ))}
        <ResumoCard icon={<FaCubes />} label={t.totalCaixas} value={`${totais.caixas.toLocaleString()} caixas`} />
        <ResumoCard icon={<FaCubes />} label={t.totalUnidades} value={`${totais.unidades.toLocaleString()} unidades`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Linha */}
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

        {/* Gráfico Pizza */}
        <GraficoBox titulo={t.proporcaoCaixas}>
          <PieChart>
            <Pie data={resumoPorMarca.map((m) => ({ nome: m.nome, value: m.pago }))} dataKey="value" nameKey="nome" cx="50%" cy="50%" outerRadius={100} label>
              {resumoPorMarca.map((_, i) => <Cell key={i} fill={cores[i % cores.length]} />)}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </GraficoBox>

        {/* Gráfico por Tipo */}
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

        {/* Top 5 Produtos */}
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
