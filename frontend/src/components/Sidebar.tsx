import React, { useEffect, useMemo, useState } from 'react';
import { NavLink } from 'react-router-dom';

import {
  FaChartPie, FaShoppingCart, FaWarehouse, FaUsers, FaDollarSign, FaCogs,
  FaBox, FaCheckCircle, FaChartBar, FaBook, FaBoxes, FaTruck, FaBuilding
} from 'react-icons/fa';
import { FaLinesLeaning, FaMoneyBills, FaPeopleGroup, FaUserShield } from 'react-icons/fa6';

import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type Item = { label: string; icon: React.ReactNode; to: string; isFirst?: boolean };
type Section = { title: string; items: Item[] };

const OPEN_W = '16rem';
const CLOSED_W = '4rem';

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((v) => !v);

  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.sidebar;

  // 👤 papel atual: 'adm' | 'filiado' | 'vendedor'
  const { tipoUsuario } = useAuth();

  // publica a largura atual da sidebar para o layout usar
  useEffect(() => {
    const w = isOpen ? OPEN_W : CLOSED_W;
    document.documentElement.style.setProperty('--sidebar-width', w);
  }, [isOpen]);

  // todos os itens visíveis (sem restrição)
  const sectionsAll: Section[] = useMemo(() => ([
    {
      title: t.dashboard,
      items: [{ label: t.mainPanel, icon: <FaChartPie />, to: '/' }],
    },
    {
      title: t.sales,
      items: [
        { label: t.newSale, icon: <FaMoneyBills />, to: '/vendas/nova', isFirst: true },
        { label: t.clientList, icon: <FaUsers />, to: '/clientes/lista' },
        { label: t.clientRegister, icon: <FaUsers />, to: '/clientes/cadastro' },
      ],
    },
    {
      title: t.stock,
      items: [
        { label: t.stockView, icon: <FaWarehouse />, to: '/estoque/visao', isFirst: true },
        { label: t.stockCurrent, icon: <FaBox />, to: '/estoque/estoqueAtual' },
        { label: t.salesHistory, icon: <FaShoppingCart />, to: '/vendas/historico' },
      ],
    },
    {
      title: t.finance,
      items: [
        { label: t.report, icon: <FaDollarSign />, to: '/financeiro/vendas', isFirst: true },
        { label: t.expenses, icon: <FaLinesLeaning />, to: '/financeiro/gastos' },
      ],
    },
    {
      title: t.settings,
      items: [
        { label: t.products, icon: <FaCogs />, to: '/config/produtos', isFirst: true },
        { label: t.team, icon: <FaPeopleGroup />, to: '/config/equipe' },
        { label: t.users, icon: <FaUserShield />, to: '/config/usuarios' },
        { label: 'Filiais', icon: <FaBuilding />, to: '/filiais' },
      ],
    },
    {
      title: t.analysis,
      items: [
        { label: t.dataLibrary, icon: <FaBook />, to: '/analise/biblioteca/dados', isFirst: true },
        { label: t.validatedClients, icon: <FaCheckCircle />, to: '/analise/biblioteca/validados' },
        { label: t.charts, icon: <FaChartBar />, to: '/analise/biblioteca/graficos' },
      ],
    },
    {
      title: '',
      items: [
        { label: t.wholesale, icon: <FaBoxes />, to: '/atacado', isFirst: true },
        { label: t.shipping, icon: <FaTruck />, to: '/distribuicao' },
      ],
    },
  ]), [t]);

  // 🔐 regras de visibilidade por papel
  const allowedByRole: Record<'adm' | 'filiado' | 'vendedor', string[] | 'ALL'> = {
    adm: 'ALL',
    filiado: 'ALL', // ajuste se quiser restringir depois
    vendedor: [
      '/',                    // Painel Geral
      '/vendas/nova',         // Nova Venda
      '/clientes/lista',
      '/clientes/cadastro',
      '/estoque/visao',
      '/estoque/estoqueAtual',
      '/vendas/historico',
      '/financeiro/vendas',   // Relatório de Vendas
    ],
  };

  // aplica o filtro por papel
  const sectionsFiltered = useMemo(() => {
    const role = (tipoUsuario ?? 'vendedor') as 'adm' | 'filiado' | 'vendedor';
    const allow = allowedByRole[role];
    const isAll = allow === 'ALL';
    return sectionsAll
      .map((sec) => ({
        ...sec,
        items: isAll ? sec.items : sec.items.filter((it) => (allow as string[]).includes(it.to)),
      }))
      .filter((sec) => sec.items.length > 0); // remove seções vazias
  }, [sectionsAll, tipoUsuario]);

  return (
    <div
      className="h-screen shadow-md flex flex-col transition-all duration-300"
      style={{
        width: isOpen ? OPEN_W : CLOSED_W,
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
      }}
    >
      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center transition-colors"
        style={{ backgroundColor: temaAtual.fundo, color: temaAtual.destaque }}
        aria-label="Alternar sidebar"
        title={isOpen ? 'Recolher' : 'Expandir'}
      >
        {isOpen ? '←' : '→'}
      </button>

      <nav className="flex flex-col mt-4">
        {sectionsFiltered.map((section, sIdx) => (
          <div key={`${section.title}-${sIdx}`} className="mb-3">
            {sIdx !== 0 && <div className="border-t border-gray-300 my-2 mx-2" />}
            {section.items.map((item, idx) => (
              <NavLink
                key={`${item.to}-${idx}`}
                to={item.to}
                className={({ isActive }) =>
                  `relative flex items-center gap-3 px-3 py-2 rounded-md transition-all group ${
                    isActive ? 'text-white' : 'hover:text-white'
                  }`
                }
                style={({ isActive }) => ({
                  backgroundColor: isActive ? temaAtual.destaque : 'transparent',
                  color: isActive ? '#fff' : item.isFirst ? temaAtual.texto : '#999',
                })}
              >
                <div className="text-[22px] relative group">
                  {item.icon}
                  {!isOpen && (
                    <span className="absolute left-14 top-1/2 -translate-y-1/2 bg-black text-white text-xs rounded px-2 py-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                      {item.label}
                    </span>
                  )}
                </div>
                {isOpen && (
                  <span className="whitespace-nowrap text-sm group-hover:font-semibold">
                    {item.label}
                  </span>
                )}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
