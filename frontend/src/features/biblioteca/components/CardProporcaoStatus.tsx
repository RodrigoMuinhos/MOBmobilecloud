import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

const coresHex = {
  cinza: '#9CA3AF',
  amarelo: '#FACC15',
  verde: '#22C55E',
  vermelho: '#EF4444',
};

const CardProporcaoStatus: React.FC = () => {
  const { temaAtual } = useTheme();
  const [dados, setDados] = useState<number[]>([0, 0, 0, 0]); // [cinza, amarelo, verde, vermelho]

  useEffect(() => {
    const clientesSalvos = JSON.parse(localStorage.getItem('clientesSalvos') || '[]');
    const statusBruto = JSON.parse(localStorage.getItem('statusClientes') || '{}');
    const validados = JSON.parse(localStorage.getItem('cnpjValidados') || '[]');

    const mapaCores: Record<string, keyof typeof coresHex> = {
      '0': 'cinza',
      '1': 'amarelo',
      '2': 'verde',
      '3': 'vermelho',
    };

    const cnpjsValidados = new Set(
      validados.map((c: any) => String(c.cnpj).replace(/\D/g, '')).filter(Boolean)
    );

    const statusCorrigido: Record<string, keyof typeof coresHex> = {};
    for (const chave in statusBruto) {
      const cnpj = String(chave).replace(/\D/g, '');
      const valor = statusBruto[chave];
      const cor = typeof valor === 'number' ? mapaCores[String(valor)] : valor;
      statusCorrigido[cnpj] = cor || 'cinza';
    }

    let cinza = 0;
    let amarelo = 0;
    let verde = 0;
    let vermelho = 0;

    clientesSalvos.forEach((cliente: any) => {
      const cnpj = String(cliente.cnpj).replace(/\D/g, '');
      const status = statusCorrigido[cnpj];

      if (cnpjsValidados.has(cnpj)) {
        verde++;
      } else if (status === 'amarelo') {
        amarelo++;
      } else if (status === 'vermelho') {
        vermelho++;
      } else {
        cinza++;
      }
    });

    setDados([cinza, amarelo, verde, vermelho]);
  }, []);

  const chartData = {
    labels: ['Não Conferido', 'Revisar', 'Ativos', 'Inativos'],
    datasets: [
      {
        data: dados,
        backgroundColor: [
          coresHex.cinza,
          coresHex.amarelo,
          coresHex.verde,
          coresHex.vermelho,
        ],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const estiloCard: React.CSSProperties = {
    background: temaAtual.cardGradient || temaAtual.card,
    color: temaAtual.texto,
    border: `1px solid ${temaAtual.destaque}`,
    backdropFilter: 'blur(8px)',
  };

  return (
    <div
      className="rounded-lg shadow p-4 w-full max-w-md flex flex-col"
      style={estiloCard}
    >
      <h2 className="text-md font-semibold mb-3">Proporção de Status</h2>

      <div className="relative h-[200px] mb-2">
        <Pie
          key={dados.join('-')}
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
            },
          }}
        />
      </div>

      <div
        className="flex justify-center gap-6 mt-4 text-sm flex-wrap"
        style={{ color: temaAtual.texto }}
      >
        {(['cinza', 'amarelo', 'verde', 'vermelho'] as const).map((cor, idx) => (
          <div key={cor} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: coresHex[cor] }}
            />
            <span className="text-xs">{dados[idx]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardProporcaoStatus;
