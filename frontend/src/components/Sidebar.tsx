import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  FaChartPie, FaShoppingCart, FaWarehouse, FaUsers, FaDollarSign, FaCogs,
  FaBox, FaCheckCircle, FaChartBar, FaBook, FaBoxes, FaTruck, FaBuilding
} from 'react-icons/fa';
import {
  FaLinesLeaning, FaMoneyBills, FaPeopleGroup, FaUserShield
} from 'react-icons/fa6';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen(!isOpen);
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.sidebar;

  const tipoUsuario = localStorage.getItem('tipoUsuario');
  const isFiliado = tipoUsuario === 'filiado';
  const isVendedor = tipoUsuario === 'vendedor';

  const sections = [
    {
      title: t.dashboard,
      items: [
        { label: t.mainPanel, icon: <FaChartPie />, to: '/' },
      ],
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
        { label: t.stockCurrent, icon: <FaBox />, to: '/estoque/EstoqueAtual' },
        ...(!isVendedor ? [{ label: t.salesHistory, icon: <FaShoppingCart />, to: '/vendas/historico' }] : []),
      ],
    },
    {
      title: t.finance,
      items: [
        { label: t.report, icon: <FaDollarSign />, to: '/financeiro/vendas', isFirst: true },
        ...(!isFiliado && !isVendedor ? [
          { label: t.expenses, icon: <FaLinesLeaning />, to: '/financeiro/gastos' }
        ] : []),
      ],
    },
    ...(!isFiliado && !isVendedor ? [{
      title: t.settings,
      items: [
        { label: t.products, icon: <FaCogs />, to: '/config/produtos', isFirst: true },
        { label: t.team, icon: <FaPeopleGroup />, to: '/config/equipe' },
        { label: t.users, icon: <FaUserShield />, to: '/config/usuarios' },
        { label: 'Filiais', icon: <FaBuilding />, to: '/filiais' }, // ✅ Nova entrada
      ],
    }] : []),
    ...(!isFiliado && !isVendedor ? [{
      title: t.analysis,
      items: [
        { label: t.dataLibrary, icon: <FaBook />, to: '/analise/biblioteca/dados', isFirst: true },
        { label: t.validatedClients, icon: <FaCheckCircle />, to: '/analise/biblioteca/validados' },
        { label: t.charts, icon: <FaChartBar />, to: '/analise/biblioteca/graficos' },
      ],
    }] : []),
    {
      title: '',
      items: [
        ...(!isFiliado && !isVendedor ? [{ label: t.wholesale, icon: <FaBoxes />, to: '/atacado', isFirst: true }] : []),
        ...(!isFiliado && !isVendedor ? [{ label: t.shipping, icon: <FaTruck />, to: '/distribuicao' }] : []),
      ],
    },
  ];

  return (
    <div
      className={`h-screen shadow-md flex flex-col transition-all duration-300 ${isOpen ? 'w-64' : 'w-16'}`}
      style={{
        backgroundColor: temaAtual.card,
        color: temaAtual.texto,
      }}
    >
      <button
        onClick={toggleSidebar}
        className="h-12 flex items-center justify-center transition-colors"
        style={{
          backgroundColor: temaAtual.fundo,
          color: temaAtual.destaque,
        }}
      >
        {isOpen ? '←' : '→'}
      </button>

      <nav className="flex flex-col mt-4">
        {sections.map((section, sIdx) => (
          <div key={sIdx} className="mb-3">
            {sIdx !== 0 && <div className="border-t border-gray-300 my-2 mx-2" />}
            {section.items.map((item, idx) => (
              <NavLink
                key={idx}
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
