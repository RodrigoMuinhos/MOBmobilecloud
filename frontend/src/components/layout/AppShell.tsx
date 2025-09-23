// components/layout/AppShell.tsx
'use client';
import React, { useEffect, useState } from 'react';
import Sidebar from '../Sidebar';
import Header from '../Header';
import { useTheme } from '../../context/ThemeContext';

const DESKTOP_W_OPEN = '16rem';
const DESKTOP_W_COLLAPSED = '4rem';
const MOBILE_HEADER_H = '56px';
const sidebarTopMobile = `calc(${MOBILE_HEADER_H} + env(safe-area-inset-top))`;

const AppShell: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { temaAtual } = useTheme();

  // drawer mobile
  const [openDrawer, setOpenDrawer] = useState(false);

  // largura da sidebar no desktop
  const [collapsed, setCollapsed] = useState(false);

  // atualiza a var global para o DESKTOP
  useEffect(() => {
    const w = collapsed ? DESKTOP_W_COLLAPSED : DESKTOP_W_OPEN;
    document.documentElement.style.setProperty('--sidebar-width', w);
  }, [collapsed]);

  // opcional: deslocamento de conteúdo no mobile quando drawer abre (se você usa em CSS)
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--content-mobile-offset',
      openDrawer ? DESKTOP_W_OPEN : '0'
    );
  }, [openDrawer]);

  return (
    <div className="min-h-screen flex" style={{ background: temaAtual.fundo, color: temaAtual.texto }}>
      {/* Sidebar: drawer no mobile, fixa no desktop */}
      <aside
        className={[
          'fixed z-40 left-0 transform transition-transform duration-200',
          openDrawer ? 'translate-x-0' : '-translate-x-full',
          'md:translate-x-0 md:static',
        ].join(' ')}
        style={{
          // MOBILE (drawer): começa abaixo do header
          top: sidebarTopMobile,
          height: `calc(100% - ${sidebarTopMobile})`,

          // DESKTOP (≥ md): a largura vem da var; quando colapsar mudamos a var
          width: 'var(--sidebar-width, 16rem)',

          // se drawer aberto no mobile, fixa 16rem
          ...(openDrawer ? { width: DESKTOP_W_OPEN } : {}),

          background: temaAtual.card,
          borderRight: `1px solid ${temaAtual.contraste}`,
        }}
      >
        {/* Passe um callback para a Sidebar alternar o colapso no desktop */}
        <Sidebar
          
        
          // pode manter suas outras props originais
        />
      </aside>

      {/* Backdrop do drawer (não cobre o header) */}
      {openDrawer && (
        <div
          className="fixed right-0 bottom-0 z-30 bg-black/40 md:hidden"
          style={{ left: 0, top: sidebarTopMobile }}
          onClick={() => setOpenDrawer(false)}
          aria-hidden
        />
      )}

      {/* Coluna principal */}
      <div className="flex-1 min-w-0">
        {/* Header único (mobile + desktop) */}
        <Header onToggleSidebar={() => setOpenDrawer(v => !v)} />

        {/* Conteúdo: usa a var no desktop */}
        <main className="app-content p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
