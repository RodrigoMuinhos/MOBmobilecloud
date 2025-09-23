// src/routes/AppRoutes.tsx
import React, { type ReactElement } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// 🔒 Auth desativado temporariamente
// import { useAuth } from '../context/AuthContext';

import MainLayout from '../layouts/MainLayout';

import LoginPage from '../features/login/pages/LoginPage';
import RecuperarSenha from '../features/login/components/RecuperarSenha';
import PreLoginScreen from '../features/login/components/PreLoginScreen';

import Dashboard from '../pages/Dashboard';

import NovaVendaPage from '../features/vendas/novavenda/NovaVendaPage';
import HistoricoVendasPage from '../features/vendas/historico/HistoricoVendasPage';

import VisaoEstoquePage from '../features/estoque/pages/VisaoEstoquePage';
import EstoqueAtualPage from '../features/estoque/pages/EstoqueAtualPage';

import ClientesPage from '../pages/ClientesPage';
import CadastroClientePage from '../features/clientes/pages/CadastroClientePage';
import ListaClientesPage from '../features/clientes/pages/ListaClientesPage';

import RelatorioVendaPage from '../features/financeiro/pages/RelatorioVendaPage';
import GastosEstoquePage from '../features/financeiro/pages/GastosEstoquePage';

import ProdutosConfigPage from '../features/config/pages/ProdutosConfigPage';
import EquipeConfigPage from '../features/config/pages/EquipeConfigPage';
import UsuariosPage from '../features/config/pages/UsuariosPage';

import FiliaisPage from '../features/filiais/FiliaisPage';
import SettingsPage from '../features/settings/pages/SettingsPage';

import BibliotecaDadosPage from '../features/biblioteca/pages/BibliotecaDadosPage';
import TabelaDadosPage from '../features/biblioteca/pages/TabelaDadosPage';
import GraficosDadosPage from '../features/biblioteca/pages/GraficosDadosPage';
import ClientesValidadosPage from '../features/biblioteca/pages/ClientesValidadosPage';

import AtacadoPage from '../features/atacado/pages/AtacadoPage';
import DistribuicaoPage from '../features/atacado/pages/DistribuicaoPage';

import NotFound from '../pages/NotFound';

// Página simples para 403 (pode ficar, mas não será usada com auth off)
const Forbidden: React.FC = () => <div style={{ padding: 24 }}>Sem permissão.</div>;

/** =========================================================
 *  🔧 Modo desenvolvimento sem restrições de login/role
 *  Basta mudar DISABLE_AUTH para false quando quiser religar.
 *  Ao religar, reative o useAuth e os guards (ver TODOs).
 *  ========================================================= */
const DISABLE_AUTH = true;

const AppRoutes: React.FC = () => {
  // TODO (quando religar auth):
  // const auth: any = useAuth();
  // const role = getRole(auth);
  // const isADM = role === 'ADM';
  // const isVendedor = role === 'VENDEDOR' || role === 'FILIADO';
  // const canVendedor = isADM || isVendedor;

  // Com auth desativado:
  const isADM = true;
  const canVendedor = true;

  // Mantemos o helper de guard para futura reativação
  const guard = (ok: boolean, el: ReactElement) => (ok ? el : <Navigate to="/403" replace />);

  return (
    <Routes>
      {/* Públicas (continuam acessíveis) */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/prelogin" element={<PreLoginScreen />} />

      {/* Privadas (agora sem bloqueio) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Dashboard />} />

        {/* Vendas */}
        <Route path="/vendas/nova" element={guard(canVendedor, <NovaVendaPage />)} />
        <Route path="/vendas/historico" element={guard(canVendedor, <HistoricoVendasPage />)} />

        {/* Estoque */}
        <Route path="/estoque/visao" element={guard(canVendedor, <VisaoEstoquePage />)} />
        <Route path="/estoque/estoqueAtual" element={guard(canVendedor, <EstoqueAtualPage />)} />

        {/* Clientes */}
        <Route path="/clientes" element={guard(canVendedor, <ClientesPage />)} />
        <Route path="/clientes/lista" element={guard(canVendedor, <ListaClientesPage />)} />
        <Route path="/clientes/cadastro" element={guard(isADM, <CadastroClientePage />)} />

        {/* Financeiro */}
        <Route path="/financeiro/vendas" element={guard(canVendedor, <RelatorioVendaPage />)} />
        <Route path="/financeiro/gastos" element={guard(isADM, <GastosEstoquePage />)} />

        {/* Config (só ADM – mas liberado enquanto DISABLE_AUTH=true) */}
        <Route path="/config/produtos" element={guard(isADM, <ProdutosConfigPage />)} />
        <Route path="/config/equipe" element={guard(isADM, <EquipeConfigPage />)} />
        <Route path="/config/usuarios" element={guard(isADM, <UsuariosPage />)} />

        {/* Demais */}
        <Route path="/filiais" element={<FiliaisPage />} />
        <Route path="/settings" element={<SettingsPage />} />

        {/* Biblioteca (só ADM – mas liberado com DISABLE_AUTH=true) */}
        <Route path="/analise/biblioteca" element={guard(isADM, <BibliotecaDadosPage />)}>
          <Route index element={<Navigate to="dados" replace />} />
          <Route path="dados" element={<TabelaDadosPage />} />
          <Route path="validados" element={<ClientesValidadosPage />} />
          <Route path="graficos" element={<GraficosDadosPage />} />
        </Route>

        {/* Atacado / Distribuição */}
        <Route path="/atacado" element={guard(isADM, <AtacadoPage />)} />
        <Route path="/distribuicao" element={guard(isADM, <DistribuicaoPage />)} />
      </Route>

      <Route path="/403" element={<Forbidden />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

/** ============================================
 *  Helper de role (guarde para religar auth)
 * ============================================ */
// function getRole(authAny: any): 'ADM' | 'VENDEDOR' | 'FILIADO' {
//   const lsUser =
//     typeof window !== 'undefined'
//       ? (() => {
//           try {
//             return JSON.parse(localStorage.getItem('ms_user') || 'null');
//           } catch {
//             return null;
//           }
//         })()
//       : null;

//   const raw =
//     authAny?.user?.tipo ??
//     authAny?.user?.perfil ??
//     authAny?.tipo ??
//     authAny?.perfil ??
//     authAny?.currentUser?.tipo ??
//     lsUser?.tipo ??
//     lsUser?.perfil ??
//     'VENDEDOR';

//   const up = String(raw).toUpperCase();
//   if (up === 'ADMIN' || up === 'ADMINISTRADOR') return 'ADM';
//   if (up === 'FILIADO') return 'FILIADO';
//   return up === 'ADM' || up === 'VENDEDOR' ? (up as any) : 'VENDEDOR';
// }
