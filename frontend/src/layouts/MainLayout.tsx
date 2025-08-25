import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';

const MainLayout = () => {
  const { temaAtual } = useTheme();

  return (
    <div style={{ backgroundColor: temaAtual.fundo, color: temaAtual.texto }} className="min-h-screen transition-all">
      {/* Header fixo no topo */}
      <Header />

      {/* Container abaixo do Header */}
      <div className="flex">
        {/* Sidebar do lado esquerdo */}
        <Sidebar />

        {/* Conteúdo principal */}
        <main className="flex-1 p-6 overflow-y-auto" style={{ backgroundColor: temaAtual.card }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;