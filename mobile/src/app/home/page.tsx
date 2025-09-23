// src/app/home/page.tsx  (ou onde você salvou a Home)
'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import FootMenu from '@/components/FootMenu';
import PageLoader from '@/components/PageLoader'; // ⬅️ adiciona

/* Paleta */
const ORANGE = '#F15A24';

const Card = ({
  href,
  title,
  subtitle,
}: { href: string; title: string; subtitle?: string }) => (
  <Link
    href={href}
    className="block rounded-2xl border border-black/10 bg-white p-4 shadow-sm hover:border-black/20 hover:bg-black/[0.02] transition"
  >
    {subtitle && <p className="text-xs text-black/50 mb-1">{subtitle}</p>}
    <h3 className="text-lg font-semibold text-black">{title}</h3>
  </Link>
);

const Kpi = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-black/10 bg-white px-3 py-3 text-center shadow-sm">
    <p className="text-xs text-black/60">{label}</p>
    <p className="mt-1 text-lg font-bold text-black">{value}</p>
  </div>
);

export default function HomePage() {
  const { user, loading, logout } = useAuth();

  useEffect(() => {
    if (!loading && !user) location.href = '/login';
  }, [loading, user]);

  // ⬇️ usa spinner central
  if (loading) return <PageLoader label="Carregando..." />;
  if (!user) return null;

  const isOffline = user?.id === 'offline-admin';

  return (
    <main className="min-h-[100dvh] bg-[#F9F8F6] pb-24">
      {/* Faixa base preta */}
      <div className="h-20 w-full bg-black" />

      <section className="-mt-10 px-4 max-w-md mx-auto">
        {/* Cabeçalho */}
        <header className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/perfil"
              className="grid place-items-center h-12 w-12 rounded-full bg-white border-2 border-black shadow-sm"
              aria-label="Ir para Perfil"
              title="Perfil"
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6 text-black" fill="currentColor" aria-hidden="true">
                <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.42 0-8 2.24-8 5v1a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-1c0-2.76-3.58-5-8-5Z"/>
              </svg>
            </Link>
            <div>
              <p className="text-xs text-black/60">Bem-vindo(a)</p>
              <h1 className="text-base font-bold text-black leading-5">
                {user?.nome ?? 'Usuário'}
                {isOffline && (
                  <span className="ml-2 rounded-full border border-black/10 bg-black/5 px-2 py-[2px] text-[11px] font-medium text-black/70">
                    Offline
                  </span>
                )}
              </h1>
              {user?.tipo && (
                <p className="text-[11px] text-black/50 mt-0.5 capitalize">{String(user.tipo)}</p>
              )}
            </div>
          </div>

          <button onClick={logout} className="text-sm underline text-black hover:opacity-80">
            Sair
          </button>
        </header>

        {/* CTA principal */}
        <Link
          href="/vendas"
          className="block w-full rounded-2xl py-3 text-center font-semibold"
          style={{ background: ORANGE, color: '#000' }}
        >
          + Nova venda
        </Link>

        {/* KPIs */}
        <section className="mt-4 grid grid-cols-3 gap-3">
          <Kpi label="Hoje" value="R$ 0,00" />
          <Kpi label="Mês" value="R$ 0,00" />
          <Kpi label="Pendentes" value="0" />
        </section>

        {/* Atalhos */}
        <section className="mt-5 grid grid-cols-2 gap-3">
          <Card href="/vendas" title="Vendas" subtitle="Abrir" />
          <Card href="/clientes" title="Clientes" subtitle="Buscar / criar" />
          <Card href="/estoque" title="Estoque" subtitle="Consultar" />
          <Card href="/relatorios" title="Relatórios" subtitle="Resumo" />
        </section>
      </section>

      <FootMenu />
    </main>
  );
}
