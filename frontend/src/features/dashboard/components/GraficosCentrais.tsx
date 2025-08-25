'use client';
import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import 'dayjs/locale/pt-br';

import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { Venda } from '../../../types/banco';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.locale('pt-br');
dayjs.tz.setDefault('America/Fortaleza');

type Props = {
  vendas?: Venda[];
};

const formatarMesAno = (data: string): string => {
  const formatos = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'DD/MM/YYYY', 'MM/YYYY'];
  for (const formato of formatos) {
    const d = dayjs(data, formato).tz();
    if (d.isValid()) return d.format('MM/YYYY');
  }
  return 'Inválido';
};

const formatarDia = (data: string): string => {
  const formatos = ['YYYY-MM-DDTHH:mm:ss.SSSZ', 'YYYY-MM-DD', 'DD/MM/YYYY'];
  for (const formato of formatos) {
    const d = dayjs(data, formato).tz();
    if (d.isValid()) return d.format('DD/MM');
  }
  return 'Inválido';
};

const GraficosCentrais: React.FC<Props> = ({ vendas = [] }) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const idioma = textos[currentLang];

  // Agrupamento mensal
  const vendasPorMes = useMemo(() => {
    const mapa: Record<string, number> = {};
    vendas.forEach((venda) => {
      const data = venda.dataVenda ?? '';
      const mes = formatarMesAno(data);
      if (mes !== 'Inválido') {
        mapa[mes] = (mapa[mes] || 0) + venda.total;
      }
    });
    return Object.entries(mapa).map(([mes, valor]) => ({ mes, valor }));
  }, [vendas]);

  // Agrupamento diário
  const vendasPorDia = useMemo(() => {
    const mapa: Record<string, number> = {};
    vendas.forEach((venda) => {
      const data = venda.dataVenda ?? '';
      const dia = formatarDia(data);
      if (dia !== 'Inválido') {
        mapa[dia] = (mapa[dia] || 0) + venda.total;
      }
    });
    return Object.entries(mapa).map(([dia, valor]) => ({ dia, valor }));
  }, [vendas]);

  // Produtos mais vendidos
  const topProdutos = useMemo(() => {
    const mapa: Record<string, number> = {};
    vendas.forEach((venda) => {
      venda.produtos?.forEach((produto) => {
        const nome = produto.nome;
        mapa[nome] = (mapa[nome] || 0) + (produto.quantidade || 1);
      });
    });
    return Object.entries(mapa)
      .map(([nome, quantidade]) => ({ nome, quantidade }))
      .sort((a, b) => b.quantidade - a.quantidade)
      .slice(0, 5);
  }, [vendas]);

  // Categorias
  const categorias = useMemo(() => {
    const mapa: Record<string, number> = {};
    vendas.forEach((venda) => {
      venda.produtos?.forEach((produto) => {
        const cat = produto.categoria ?? 'Outros';
        mapa[cat] = (mapa[cat] || 0) + 1;
      });
    });
    return Object.entries(mapa).map(([categoria, quantidade]) => ({ categoria, quantidade }));
  }, [vendas]);

  const gerarCorCategoria = (i: number) => {
    const base = [
      temaAtual.destaque,
      temaAtual.contraste,
      temaAtual.textoBranco,
      '#888888',
    ];
    return base[i % base.length];
  };

  const cardClasses = `rounded-lg shadow p-4 border backdrop-blur-md bg-opacity-60 relative`;
  const cardStyle = {
    background: temaAtual.cardGradient || temaAtual.card,
    color: temaAtual.texto,
    borderColor: temaAtual.destaque,
  };

  return (
    <>
      {/* Faturamento Mensal e Top Produtos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={cardClasses} style={cardStyle}>
          <span className="absolute -top-3 right-0 bg-indigo-600 text-white text-[10px] px-2 py-[1px] rounded-bl z-10 font-bold">
            GRAFICOS CENTRAIS
          </span>

          <h2 className="text-lg font-bold mb-2">{idioma.dashboard.faturamento}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={vendasPorMes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="valor" fill={temaAtual.destaque} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClasses} style={cardStyle}>
          <h2 className="text-lg font-bold mb-2">{idioma.dashboard.topProdutos}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topProdutos} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="nome" type="category" />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantidade" fill={temaAtual.contraste} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Receita Diária e Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className={cardClasses} style={cardStyle}>
          <h2 className="text-lg font-bold mb-2">{idioma.dashboard.receitaDiaria}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={vendasPorDia}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dia" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="valor"
                stroke={temaAtual.destaque}
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className={cardClasses} style={cardStyle}>
          <h2 className="text-lg font-bold mb-2">{idioma.dashboard.distribuicaoCategoria}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categorias}
                dataKey="quantidade"
                nameKey="categoria"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label
              >
                {categorias.map((_, i) => (
                  <Cell key={`cell-${i}`} fill={gerarCorCategoria(i)} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </>
  );
};

export default GraficosCentrais;
