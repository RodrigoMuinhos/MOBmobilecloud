import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { useLanguage } from '../../../context/LanguageContext';

type Props = {
  totalClientes: number;
  totalVendas: number;
};

const Conquistas: React.FC<Props> = ({ totalClientes, totalVendas }) => {
  const { temaAtual } = useTheme();
  const { textos, currentLang } = useLanguage();
  const t = textos[currentLang].dashboard;

  const containerStyle = {
    background: (temaAtual as any).cardGradient || temaAtual.card,
    color: temaAtual.texto,
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: `1px solid ${temaAtual.destaque}`,
  };

  const cardStyle = {
    backgroundColor: temaAtual.fundoAlt,
    color: temaAtual.texto,
    border: `1px solid ${temaAtual.contraste}`,
  };

  const medalhaStyle = (ativa: boolean) => ({
    opacity: ativa ? 1 : 0.2,
    fontSize: '1.25rem',
  });

  const barraBaseStyle = { backgroundColor: temaAtual.fundoAlt };
  const barraProgressoClientes = {
    width: `${Math.min((totalClientes / 30) * 100, 100)}%`,
    background: temaAtual.destaque,
    height: '100%',
    transition: 'width 0.7s ease-in-out',
  };
  const barraProgressoVendas = {
    width: `${Math.min((totalVendas / 30) * 100, 100)}%`,
    background: temaAtual.contraste,
    height: '100%',
    transition: 'width 0.7s ease-in-out',
  };

  return (
    <>
      <div className="p-6 rounded-lg shadow mb-6" style={containerStyle}>
        <h2 className="text-lg font-bold mb-4 text-center" style={{ color: temaAtual.destaque }}>
          {t.conquistas}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg" style={cardStyle}>
            <p className="text-sm mb-1">{t.clientesMeta}</p>
            <p className="text-2xl font-bold">{totalClientes}</p>
            <div className="flex gap-2 mt-2">
              <span style={medalhaStyle(totalClientes >= 10)}>🥉</span>
              <span style={medalhaStyle(totalClientes >= 25)}>🥈</span>
              <span style={medalhaStyle(totalClientes >= 70)}>🥇</span>
            </div>
          </div>

          <div className="p-4 rounded-lg" style={cardStyle}>
            <p className="text-sm mb-1">{t.vendasMeta}</p>
            <p className="text-2xl font-bold">{totalVendas}</p>
            <div className="flex gap-2 mt-2">
              <span style={medalhaStyle(totalVendas >= 10)}>🥉</span>
              <span style={medalhaStyle(totalVendas >= 30)}>🥈</span>
              <span style={medalhaStyle(totalVendas >= 70)}>🥇</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-lg shadow" style={containerStyle}>
        <h2 className="text-lg font-bold mb-4 text-center" style={{ color: temaAtual.destaque }}>
          {t.progressoMetas}
        </h2>
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-1">{t.clientesMeta}: {totalClientes}/30</p>
            <div className="w-full rounded h-3 overflow-hidden" style={barraBaseStyle}>
              <div style={barraProgressoClientes} />
            </div>
          </div>
          <div>
            <p className="text-sm mb-1">{t.vendasMeta}: {totalVendas}/30</p>
            <div className="w-full rounded h-3 overflow-hidden" style={barraBaseStyle}>
              <div style={barraProgressoVendas} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Conquistas;
