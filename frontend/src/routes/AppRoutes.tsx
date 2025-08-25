import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layout principal
import MainLayout from '../layouts/MainLayout';

// Login e Recuperação
import LoginPage from '../features/login/pages/LoginPage';
import RecuperarSenha from '../features/login/components/RecuperarSenha';
import PreLoginScreen from '../features/login/components/PreLoginScreen';

// Dashboard
import Dashboard from '../pages/Dashboard';

// Vendas
import NovaVendaPage from '../features/vendas/novavenda/NovaVendaPage';
import HistoricoVendasPage from '../features/vendas/historico/HistoricoVendasPage';

// Estoque
import VisaoEstoquePage from '../features/estoque/pages/VisaoEstoquePage';
import EstoqueAtualPage from '../features/estoque/pages/EstoqueAtualPage';

// Clientes
import ClientesPage from '../pages/ClientesPage';
import CadastroClientePage from '../features/clientes/pages/CadastroClientePage';
import ListaClientesPage from '../features/clientes/pages/ListaClientesPage';

// Financeiro
import RelatorioVendaPage from '../features/financeiro/pages/RelatorioVendaPage';
import GastosEstoquePage from '../features/financeiro/pages/GastosEstoquePage';

// Configurações
import ProdutosConfigPage from '../features/config/pages/ProdutosConfigPage';
import EquipeConfigPage from '../features/config/pages/EquipeConfigPage';
import UsuariosPage from '../features/config/pages/UsuariosPage';

// Filiais
import FiliaisPage from '../features/filiais/FiliaisPage';

// Settings
import SettingsPage from '../features/settings/pages/SettingsPage';

// Biblioteca de Dados
import BibliotecaDadosPage from '../features/biblioteca/pages/BibliotecaDadosPage';
import TabelaDadosPage from '../features/biblioteca/pages/TabelaDadosPage';
import GraficosDadosPage from '../features/biblioteca/pages/GraficosDadosPage';
import ClientesValidadosPage from '../features/biblioteca/pages/ClientesValidadosPage';

// Atacado e Distribuição
import AtacadoPage from '../features/atacado/pages/AtacadoPage';
import DistribuicaoPage from '../features/atacado/pages/DistribuicaoPage';

// Página 404
import NotFound from '../pages/NotFound';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Páginas fora do layout principal */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      <Route path="/prelogin" element={<PreLoginScreen />} /> {/* ✅ removido onContinuar */}

      {/* Layout com Sidebar */}
      <Route element={<MainLayout />}>
        {/* Dashboard */}
        <Route path="/" element={<Dashboard />} />

        {/* Vendas */}
        <Route path="/vendas/nova" element={<NovaVendaPage />} />
        <Route path="/vendas/historico" element={<HistoricoVendasPage />} />

        {/* Estoque */}
        <Route path="/estoque/visao" element={<VisaoEstoquePage />} />
        <Route path="/estoque/estoqueAtual" element={<EstoqueAtualPage />} />

        {/* Clientes */}
        <Route path="/clientes" element={<ClientesPage />} />
        <Route path="/clientes/cadastro" element={<CadastroClientePage />} />
        <Route path="/clientes/lista" element={<ListaClientesPage />} />

        {/* Financeiro */}
        <Route path="/financeiro/vendas" element={<RelatorioVendaPage />} />
        <Route path="/financeiro/gastos" element={<GastosEstoquePage />} />

        {/* Configurações */}
        <Route path="/config/produtos" element={<ProdutosConfigPage />} />
        <Route path="/config/equipe" element={<EquipeConfigPage />} />
        <Route path="/config/usuarios" element={<UsuariosPage />} />

        {/* Filiais */}
        <Route path="/filiais" element={<FiliaisPage />} /> {/* ✅ nova rota visível a todos */}

        {/* Settings */}
        <Route path="/settings" element={<SettingsPage />} />

        {/* Biblioteca de Dados */}
        <Route path="/analise/biblioteca" element={<BibliotecaDadosPage />}>
          <Route index element={<Navigate to="dados" replace />} />
          <Route path="dados" element={<TabelaDadosPage />} />
          <Route path="validados" element={<ClientesValidadosPage />} />
          <Route path="graficos" element={<GraficosDadosPage />} />
        </Route>

        {/* Atacado e Distribuição */}
        <Route path="/atacado" element={<AtacadoPage />} />
        <Route path="/distribuicao" element={<DistribuicaoPage />} />
      </Route>

      {/* Página 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
