import React, { useEffect, useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';

const cores = {
  cinza: '#9CA3AF',
  amarelo: '#FACC15',
  verde: '#22C55E',
  vermelho: '#EF4444',
};

const CardBarraConferidos: React.FC = () => {
  const { temaAtual } = useTheme();
  const [dados, setDados] = useState({ cinza: 0, amarelo: 0, verde: 0, vermelho: 0 });

  useEffect(() => {
    const clientesSalvos = JSON.parse(localStorage.getItem('clientesSalvos') || '[]');
    const statusRaw = JSON.parse(localStorage.getItem('statusClientes') || '{}');
    const validados = JSON.parse(localStorage.getItem('cnpjValidados') || '[]');

    const cnpjsValidados = new Set(
      validados.map((c: any) => String(c.cnpj).replace(/\D/g, '')).filter(Boolean)
    );

    const statusMap: Record<string, string> = {};
    for (const key in statusRaw) {
      const limpo = String(key).replace(/\D/g, '');
      const valor = statusRaw[key];
      const cor =
        typeof valor === 'number'
          ? ['cinza', 'amarelo', 'verde', 'vermelho'][valor] || 'cinza'
          : valor;
      statusMap[limpo] = cor;
    }

    let cinza = 0;
    let amarelo = 0;
    let verde = 0;
    let vermelho = 0;

    clientesSalvos.forEach((c: any) => {
      const cnpj = String(c.cnpj).replace(/\D/g, '');
      if (cnpjsValidados.has(cnpj)) {
        verde++;
      } else {
        const cor = statusMap[cnpj] || 'cinza';
        if (cor === 'amarelo') amarelo++;
        else if (cor === 'vermelho') vermelho++;
        else cinza++;
      }
    });

    setDados({ cinza, amarelo, verde, vermelho });
  }, []);

  const total = dados.cinza + dados.amarelo + dados.verde + dados.vermelho;

  const calcularLargura = (valor: number) =>
    total === 0 ? '0%' : `${(valor / total) * 100}%`;

  const estiloCard: React.CSSProperties = {
    background: temaAtual.cardGradient || temaAtual.card,
    color: temaAtual.texto,
    border: `1px solid ${temaAtual.destaque}`,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
  };

  return (
    <div className="rounded-lg shadow p-4 w-full" style={estiloCard}>
      <h3 className="font-bold mb-2 text-sm">Progresso de Conferência</h3>

      <div className="w-full h-6 flex rounded overflow-hidden border" style={{ borderColor: temaAtual.destaque }}>
        <div style={{ width: calcularLargura(dados.cinza), backgroundColor: cores.cinza }} />
        <div style={{ width: calcularLargura(dados.amarelo), backgroundColor: cores.amarelo }} />
        <div style={{ width: calcularLargura(dados.verde), backgroundColor: cores.verde }} />
        <div style={{ width: calcularLargura(dados.vermelho), backgroundColor: cores.vermelho }} />
      </div>

      <div className="text-xs text-right mt-1" style={{ color: temaAtual.texto }}>
        {total - dados.cinza} de {total} conferidos
      </div>

      <div className="flex gap-4 justify-center mt-2 text-xs" style={{ color: temaAtual.texto }}>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cores.cinza }} />
          {dados.cinza}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cores.amarelo }} />
          {dados.amarelo}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cores.verde }} />
          {dados.verde}
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cores.vermelho }} />
          {dados.vermelho}
        </div>
      </div>
    </div>
  );
};

export default CardBarraConferidos;
