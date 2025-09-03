// components/layout/AppShell.tsx
'use client';
import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import { useTheme } from '../../context/ThemeContext';

const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { temaAtual } = useTheme();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      {/* Sidebar */}
      <aside
        className={`
          fixed z-30 top-0 left-0 h-full w-64 transform transition-transform duration-200
          ${open ? 'translate-x-0' : '-translate-x-full'}
          md:translate-x-0 md:static
        `}
        style={{ background: temaAtual.card, borderRight: `1px solid ${temaAtual.contraste}` }}
      >
        <div className="p-4 font-bold">MOBsupply</div>
        <nav className="px-2 pb-6 space-y-1">
          {/* Coloque seus itens de menu aqui */}
          <a className="block rounded px-3 py-2 hover:opacity-90" style={{ background: temaAtual.cardHover }}>Painel</a>
          <a className="block rounded px-3 py-2 hover:opacity-90">Relatórios</a>
          <a className="block rounded px-3 py-2 hover:opacity-90">Estoque</a>
          <a className="block rounded px-3 py-2 hover:opacity-90">Vendas</a>
        </nav>
      </aside>

      {/* Conteúdo */}
      <div className="flex-1 min-w-0 md:ml-0">
        {/* Topbar mobile */}
        <header
          className="sticky top-0 z-20 md:hidden flex items-center gap-3 px-4 py-3"
          style={{ background: temaAtual.card, borderBottom: `1px solid ${temaAtual.contraste}` }}
        >
          <button
            onClick={() => setOpen((v) => !v)}
            className="p-2 rounded-md"
            style={{ background: temaAtual.cardHover }}
          >
            <FiMenu />
          </button>
          <div className="font-semibold">MOBsupply</div>
        </header>

        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppShell;
