// components/Header.tsx
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlusCircle, FaBell, FaUserCircle, FaMoon, FaSun,
  FaSatelliteDish, FaUserShield, FaImage, FaTimesCircle, FaCog
} from 'react-icons/fa';
import { FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

type HeaderProps = {
  onToggleSidebar?: () => void;
};

const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();
  const { temaSelecionado, setTemaSelecionado, temaAtual } = useTheme();
  const { tipoUsuario, loginAtivo, logout } = useAuth();
  const { currentLang, toggleLanguage } = useLanguage();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [avatar, setAvatar] = useState<string | null>(null);

  // Carrega nome/avatar (mantém compatibilidade com seu fluxo atual)
  useEffect(() => {
    const atualizar = () => {
      const dados = localStorage.getItem('USUARIO_ATUAL');
      if (!dados) return;
      const user = JSON.parse(dados);
      setNomeUsuario(user?.nome?.split(' ')[0] || 'Usuário');
      setAvatar(user?.avatar || null);
    };
    atualizar();
    const onStorage = () => atualizar();
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  // Fechar menu ao clicar fora
  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const alternarTema = () => {
    if (temaSelecionado === 'dark') setTemaSelecionado('cyber');
    else if (temaSelecionado === 'cyber') setTemaSelecionado('classic');
    else setTemaSelecionado('dark');
  };

  const getIconeTema = () => {
    switch (temaSelecionado) {
      case 'dark': return <FaMoon />;
      case 'cyber': return <FaSatelliteDish />;
      case 'classic': return <FaSun />;
      default: return <FaMoon />;
    }
  };

  const handleLogout = () => {
    if (!loginAtivo) return;
    if (confirm('Tem certeza que deseja sair do sistema?')) {
      logout();
      navigate('/login');
    }
  };

  const tipoUsuarioCor: Record<string, string> = {
    adm: '#8b5cf6',
    filiado: '#10b981',
    vendedor: '#f97316',
  };

  const saudacao = `Olá, ${nomeUsuario}`;
  const corSaudacao = tipoUsuarioCor[tipoUsuario || ''] || temaAtual.texto;

  const botoes = [
    { icon: <FaPlusCircle />, action: () => navigate('/vendas/nova'), title: 'Nova Venda', showMd: true },
    { icon: <FaBell />, action: () => {}, title: 'Notificações', showMd: true },
    ...(tipoUsuario === 'adm'
      ? [{ icon: <FaUserShield />, action: () => navigate('/config/usuarios'), title: 'Usuários', showMd: true }]
      : []),
    {
      icon: (
        <span className="text-xs font-bold" style={{ color: temaAtual.destaque }}>
          {currentLang === 'pt' ? 'EN' : 'PT'}
        </span>
      ),
      action: toggleLanguage,
      title: 'Trocar Idioma',
      showMd: false, // aparece também no mobile
    },
    { icon: getIconeTema(), action: alternarTema, title: 'Trocar Tema', showMd: false },
    ...(tipoUsuario === 'adm'
      ? [{ icon: <FaImage />, action: () => fileInputRef.current?.click(), title: 'Alterar Avatar', showMd: false }]
      : []),
    { icon: <FaTimesCircle />, action: handleLogout, title: 'Sair', showMd: false },
  ];

  return (
    <header
      className="w-full sticky top-0 z-50"
      style={{
        background: temaAtual.cardGradient || temaAtual.card,
        color: temaAtual.texto,
        borderBottom: `1px solid ${temaAtual.destaque}`,
        paddingTop: 'env(safe-area-inset-top)',
      }}
    >
      {/* Barra principal — MOBILE FIRST */}
      <div className="h-[56px] px-3 flex items-center justify-between gap-2">
        {/* Esquerda: hamburger (mobile) + marca + saudação (md+) */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Hambúrguer só no mobile; dispara o drawer do AppShell */}
          <button
            onClick={onToggleSidebar}
            className="md:hidden w-9 h-9 rounded-md border flex items-center justify-center active:scale-95"
            style={{ borderColor: temaAtual.destaque, background: temaAtual.card }}
            aria-label="Abrir menu lateral"
            title="Abrir menu lateral"
          >
            <FiMenu />
          </button>

          <div className="min-w-0">
            <div className="text-xl font-extrabold tracking-tight leading-none">
              MOB<span className="opacity-80">supply</span>
            </div>
            <div className="hidden md:block text-xs" style={{ color: corSaudacao }}>
              {saudacao}
            </div>
          </div>
        </div>

        {/* Direita: avatar (opcional no xs) + ⚙️ sempre visível */}
        <div className="flex items-center gap-2">
          {/* Avatar (escondido no xs para priorizar espaço) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="hidden sm:flex w-9 h-9 rounded-full overflow-hidden border items-center justify-center active:scale-95"
            style={{ borderColor: temaAtual.destaque }}
            title="Editar Avatar"
            aria-label="Editar Avatar"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUserCircle className="text-xl opacity-80" />
            )}
          </button>

          {/* Engrenagem */}
          <div className="relative" ref={menuRef}>
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={() => setMenuAberto((v) => !v)}
              className="text-2xl p-2 rounded-full border"
              title="Abrir configurações"
              aria-label="Abrir configurações"
              style={{ backgroundColor: temaAtual.card, borderColor: temaAtual.destaque }}
            >
              <FaCog />
            </motion.button>

            {/* Menu flutuante em “bolhas” */}
            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 4 }}
                  transition={{ duration: 0.18 }}
                  className="absolute top-[calc(100%+8px)] right-0 flex items-center gap-2 z-50"
                >
                  {botoes.map((btn, idx) => {
                    const isDesktopOnly = btn.showMd === true;
                    const hiddenClass = isDesktopOnly ? 'hidden md:flex' : 'flex';
                    return (
                      <motion.button
                        key={idx}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                          btn.action();
                          setMenuAberto(false);
                        }}
                        className={`${hiddenClass} w-10 h-10 rounded-full items-center justify-center border`}
                        title={btn.title}
                        aria-label={btn.title}
                        style={{
                          backgroundColor: temaAtual.card,
                          color: temaAtual.texto,
                          borderColor: temaAtual.destaque,
                        }}
                      >
                        {btn.icon}
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* input oculto para avatar */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={() => {}}
        className="hidden"
      />
    </header>
  );
};

export default Header;
