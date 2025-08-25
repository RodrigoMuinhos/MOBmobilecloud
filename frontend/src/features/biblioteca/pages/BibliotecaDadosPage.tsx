import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import CardDisparosPorDia from '../components/CardDisparosPorDia';
import CardProporcaoStatus from '../components/CardProporcaoStatus';
import CardBarraConferidos from '../components/CardBarraConferidos';
import { useTheme } from '../../../context/ThemeContext';

const BibliotecaDadosPage: React.FC = () => {
  const location = useLocation();
  const { temaAtual } = useTheme();

  const abas = [
    { label: 'Biblioteca de Dados', path: 'dados' },
    { label: 'Clientes Validados', path: 'validados' },
    { label: 'Gráficos', path: 'graficos' },
  ];

  return (
    <div className="p-6 min-h-screen" style={{ background: temaAtual.fundo }}>
      <h1 className="text-2xl font-bold mb-6" style={{ color: temaAtual.texto }}>
        Biblioteca de Dados
      </h1>

      {/* Abas de navegação internas */}
      <div className="flex gap-4 mb-6 border-b border-gray-600 pb-2">
        {abas.map((aba) => (
          <NavLink
            key={aba.path}
            to={aba.path}
            className={({ isActive }) =>
              `px-4 py-2 rounded text-sm font-medium transition ${
                isActive
                  ? 'text-white'
                  : 'text-gray-300 hover:text-white hover:bg-opacity-10'
              }`
            }
            style={{
              backgroundColor: temaAtual.card,
              border: `1px solid ${temaAtual.destaque}`,
              color: temaAtual.texto,
            }}
          >
            {aba.label}
          </NavLink>
        ))}
      </div>

      {/* Cards de gráficos no topo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <CardDisparosPorDia />
        <CardProporcaoStatus />
        <CardBarraConferidos />
      </div>

      {/* Conteúdo dinâmico */}
      <Outlet />
    </div>
  );
};

export default BibliotecaDadosPage;
