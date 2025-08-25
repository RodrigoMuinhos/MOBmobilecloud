'use client';
import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';
import { textos } from '../../../i18n/textos';
import { VendaAPI } from '../../../types/api/vendaApi.types';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ChartDataLabels);

type Props = {
  vendas: VendaAPI[];
};

const ResumoFinanceiro: React.FC<Props> = ({ vendas }) => {
  const { temaAtual } = useTheme();
  const { currentLang } = useLanguage();
  const t = textos[currentLang].financeiro;

  const [modelos, setModelos] = useState<Record<string, number>>({});
  const [marcas, setMarcas] = useState<Record<string, number>>({});

  useEffect(() => {
    console.log('📦 VENDAS RECEBIDAS:', vendas);

    const novosModelos: Record<string, number> = {};
    const novasMarcas: Record<string, number> = {};

    vendas.forEach((venda) => {
      const itensVenda = Array.isArray(venda.carrinho) ? venda.carrinho : [];

      itensVenda.forEach((item) => {
        console.log('🛒 ITEM DO CARRINHO:', {
          nome: item.nome,
          marca: item.marca,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
        });

        const marca = item.marca || item.nome.split(' / ')[0];
        const modelo = item.nome.trim().split(' ').pop() || '';

        if (marca && !marca.includes(' ')) {
          novasMarcas[marca] = (novasMarcas[marca] || 0) + (item.quantidade || 0);
        }

        if (modelo) {
          novosModelos[modelo] = (novosModelos[modelo] || 0) + (item.quantidade || 0);
        }
      });
    });

    setModelos(novosModelos);
    setMarcas(novasMarcas);
  }, [vendas]);

  const criarDadosGrafico = (
    data: Record<string, number>,
    maxItems: number,
    corPrincipal: string,
    corAlternativa: string
  ) => {
    const entradasOrdenadas = Object.entries(data)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxItems);

    if (entradasOrdenadas.length === 0) {
      return { labels: [], datasets: [] };
    }

    const max = Math.max(...entradasOrdenadas.map(([_, q]) => q));

    return {
      labels: entradasOrdenadas.map(([nome]) => nome),
      datasets: [
        {
          label: 'Qtd',
          data: entradasOrdenadas.map(([_, qtd]) => qtd),
          backgroundColor: entradasOrdenadas.map(([_, qtd]) =>
            qtd === max ? corPrincipal : corAlternativa
          ),
        },
      ],
    };
  };

  const opcoesGrafico: ChartOptions<'bar'> = {
    plugins: {
      legend: { display: false },
      datalabels: {
        anchor: 'end',
        align: 'end',
        color: temaAtual.texto,
        font: { weight: 'bold', size: 11 },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
    scales: { y: { beginAtZero: true } },
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div className="shadow rounded p-4" style={{ backgroundColor: temaAtual.card }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: temaAtual.texto }}>
          {t?.modelos ?? 'Modelos mais vendidos'}
        </h3>
        <div className="h-64">
          <Bar
            data={criarDadosGrafico(modelos, 7, temaAtual.destaque, temaAtual.textoClaro)}
            options={opcoesGrafico}
          />
        </div>
      </div>

      <div className="shadow rounded p-4" style={{ backgroundColor: temaAtual.card }}>
        <h3 className="text-lg font-bold mb-2" style={{ color: temaAtual.texto }}>
          {t?.marcas ?? 'Marcas mais vendidas'}
        </h3>
        <div className="h-64">
          <Bar
            data={criarDadosGrafico(marcas, 7, temaAtual.destaque, temaAtual.textoClaro)}
            options={opcoesGrafico}
          />
        </div>
      </div>
    </div>
  );
};

export default ResumoFinanceiro;
