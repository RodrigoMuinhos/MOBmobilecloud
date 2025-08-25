'use client';

import React, { useRef } from 'react';
import { VendaAPI } from '../../../types/api/vendaApi.types'; // ✅ tipo atualizado
import { useTheme } from '../../../context/ThemeContext';
import { useIdioma } from '../../../context/IdiomaContext';

import html2pdf from 'html2pdf.js';
import { FaTimes, FaFilePdf } from 'react-icons/fa';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ChartDataLabels
);

type Props = {
  vendasFiltradas: VendaAPI[];
  onClose: () => void;
};

const ModalRelatorioPDF: React.FC<Props> = ({ vendasFiltradas, onClose }) => {
  const { temaAtual } = useTheme();
  const { idioma } = useIdioma();
  const t = idioma.relatorio;
  const refPDF = useRef<HTMLDivElement>(null);

  const gerarPDF = () => {
    if (refPDF.current) {
      const opcoes = {
        margin: 10,
        filename: 'relatorio-vendas.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      };
      html2pdf().set(opcoes).from(refPDF.current).save();
    }
  };

  const contagemProdutos: Record<string, number> = {};
  vendasFiltradas.forEach((v) => {
    (v.produtos || []).forEach((p) => {
      const nome = p.nome || 'Sem nome';
      const qtd = p.quantidade || 0;
      contagemProdutos[nome] = (contagemProdutos[nome] || 0) + qtd;
    });
  });

  const topProdutos = Object.entries(contagemProdutos)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const dataBarra = {
    labels: topProdutos.map(([nome]) => nome),
    datasets: [
      {
        label: t.produtosMaisVendidos,
        data: topProdutos.map(([, qtd]) => qtd),
        backgroundColor: topProdutos.map((_, i) => `hsl(${i * 60}, 70%, 60%)`),
      },
    ],
  };

  const pagamentoResumo: Record<string, number> = {};
  vendasFiltradas.forEach((v) => {
    const metodo = v.formaPagamento || 'Outro';
    pagamentoResumo[metodo] = (pagamentoResumo[metodo] || 0) + 1;
  });

  const cores = Object.keys(pagamentoResumo).map((_, i) => `hsl(${i * 60}, 70%, 60%)`);

  const dataPizza = {
    labels: Object.keys(pagamentoResumo),
    datasets: [
      {
        data: Object.values(pagamentoResumo),
        backgroundColor: cores,
      },
    ],
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div
        className="fixed top-1/2 left-1/2 w-[95%] md:w-[850px] max-h-[90vh] overflow-y-auto transform -translate-x-1/2 -translate-y-1/2 p-6 rounded-xl shadow-lg z-50"
        style={{ backgroundColor: temaAtual.card, color: temaAtual.texto }}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{t.relatorioPDF}</h2>
          <button onClick={onClose} className="text-red-500">
            <FaTimes />
          </button>
        </div>

        <div ref={refPDF} className="bg-white text-black p-4 rounded-lg">
          <h3 className="text-lg font-bold mb-2">{t.produtosMaisVendidos}</h3>
          <Bar data={dataBarra} />

          <h3 className="text-lg font-bold mt-6 mb-2">{t.formasPagamento}</h3>
          <Pie data={dataPizza} />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            onClick={gerarPDF}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <FaFilePdf />
            {t.gerarPDF}
          </button>
        </div>
      </div>
    </>
  );
};

export default ModalRelatorioPDF;
