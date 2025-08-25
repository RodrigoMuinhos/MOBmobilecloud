import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useTheme } from '../context/ThemeContext';

const AppContent = () => {
  const { temaAtual } = useTheme();

  return (
    <div
      className="flex h-screen font-sans transition-all duration-300"
      style={{
        backgroundColor: temaAtual.fundo,
        color: temaAtual.texto,
      }}
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />

        <main
          className="flex-1 overflow-y-auto p-6 shadow-inner rounded-tl-lg transition-all duration-300"
          style={{
            backgroundColor: temaAtual.card,
            color: temaAtual.texto,
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppContent;