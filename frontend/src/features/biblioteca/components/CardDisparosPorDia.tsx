import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

// Agrupa registros por data (apenas o dia)
const agruparPorData = (registros: any[]) => {
  const contagem: Record<string, number> = {};
  registros.forEach(({ data }) => {
    const dia = data?.split(' ')[0]; // formato "dd/mm/yyyy"
    if (dia) contagem[dia] = (contagem[dia] || 0) + 1;
  });
  return contagem;
};

const CardDisparosPorDia: React.FC = () => {
  const { temaAtual } = useTheme();
  const [dados, setDados] = useState<any[]>([]);
  const [disparosPorDia, setDisparosPorDia] = useState<Record<string, number>>({});

  useEffect(() => {
    const bruto = JSON.parse(localStorage.getItem('disparosWpp') || '[]');
    const registros = Array.isArray(bruto) ? bruto : [];
    setDados(registros);
    setDisparosPorDia(agruparPorData(registros));
  }, []);

  const labels = Object.keys(disparosPorDia);
  const valores = Object.values(disparosPorDia);

  const dataGrafico = {
    labels,
    datasets: [
      {
        label: 'Disparos por dia',
        data: valores,
        fill: false,
        borderColor: temaAtual.destaque,
        pointBackgroundColor: temaAtual.destaque,
        pointBorderColor: '#fff',
        pointRadius: 4,
        tension: 0.4,
      },
    ],
  };

  const opcoesGrafico = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: temaAtual.card,
        titleColor: temaAtual.texto,
        bodyColor: temaAtual.texto,
      },
    },
    scales: {
      x: {
        ticks: {
          color: temaAtual.texto,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: { display: false },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: temaAtual.texto,
          precision: 0,
          stepSize: 1,
        },
        grid: {
          color: temaAtual.texto + '22',
        },
      },
    },
  };

  const estiloCard: React.CSSProperties = {
    background: temaAtual.cardGradient || temaAtual.card,
    color: temaAtual.texto,
    border: `1px solid ${temaAtual.destaque}`,
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      className="rounded-lg shadow p-4 w-full max-w-md h-[320px] flex flex-col justify-between"
      style={estiloCard}
    >
      <h2 className="text-md font-semibold mb-2">
        Disparos realizados: {dados.length}
      </h2>
      <div className="flex-1 relative">
        <Line data={dataGrafico} options={opcoesGrafico} />
      </div>
    </div>
  );
};

export default CardDisparosPorDia;
