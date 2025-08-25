import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaPlusCircle,
  FaBell,
  FaUserCircle,
  FaMoon,
  FaSun,
  FaSatelliteDish,
  FaUserShield,
  FaImage,
  FaTimesCircle,
  FaCog,
} from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext'; // ✅ atualizado
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { temaSelecionado, setTemaSelecionado, temaAtual } = useTheme();
  const { tipoUsuario, loginAtivo, logout } = useAuth();
  const { currentLang, toggleLanguage } = useLanguage(); // ✅ atualizado

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const [menuAberto, setMenuAberto] = useState(false);
  const [nomeUsuario, setNomeUsuario] = useState('Usuário');
  const [avatar, setAvatar] = useState<string | null>(null);

  const atualizarDadosUsuario = () => {
    const dados = localStorage.getItem('USUARIO_ATUAL');
    if (dados) {
      const user = JSON.parse(dados);
      const primeiroNome = user?.nome?.split(' ')[0] || 'Usuário';
      setNomeUsuario(primeiroNome);
      setAvatar(user?.avatar || null);
    }
  };

  useEffect(() => {
    atualizarDadosUsuario();
    const listener = () => atualizarDadosUsuario();
    window.addEventListener('storage', listener);
    return () => window.removeEventListener('storage', listener);
  }, []);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'g') {
        setMenuAberto((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleClickFora = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuAberto(false);
      }
    };
    document.addEventListener('mousedown', handleClickFora);
    return () => document.removeEventListener('mousedown', handleClickFora);
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
    if (loginAtivo) {
      const confirmar = confirm('Tem certeza que deseja sair do sistema?');
      if (confirmar) {
        logout();
        navigate('/login');
      }
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
    { icon: <FaPlusCircle />, action: () => navigate('/vendas/nova'), title: 'Nova Venda' },
    ...(tipoUsuario === 'adm'
      ? [{ icon: <FaUserShield />, action: () => navigate('/config/usuarios'), title: 'Usuários' }]
      : []),
    {
      icon: (
        <span style={{ color: temaAtual.destaque }} className="text-xs font-bold">
          {currentLang === 'pt' ? 'EN' : 'PT'}
        </span>
      ),
      action: toggleLanguage,
      title: 'Trocar Idioma',
    },
    { icon: getIconeTema(), action: alternarTema, title: 'Trocar Tema' },
    { icon: <FaBell />, action: () => {}, title: 'Notificações' },
    ...(tipoUsuario === 'adm'
      ? [{ icon: <FaImage />, action: () => fileInputRef.current?.click(), title: 'Alterar Avatar' }]
      : []),
    { icon: <FaTimesCircle />, action: handleLogout, title: 'Sair' },
  ];

  return (
    <header
      className="w-full shadow-md z-50 backdrop-blur-md relative"
      style={{
        background: temaAtual.cardGradient || temaAtual.card,
        color: temaAtual.texto,
        borderBottom: `1px solid ${temaAtual.destaque}`,
      }}
    >
      <div className="relative w-full h-[64px] px-4">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-extrabold tracking-tight">
          MOBsupply
        </div>

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-4">
          <span
            className="hidden md:block font-medium text-sm"
            style={{ color: corSaudacao }}
          >
            {saudacao}
          </span>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-9 h-9 rounded-full overflow-hidden border-2 flex items-center justify-center hover:scale-110 transition"
            title="Editar Avatar"
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <FaUserCircle className="text-xl text-gray-700" />
            )}
          </button>

          <div className="relative" ref={menuRef}>
            <motion.button
              whileHover={{ scale: 1.2, backgroundColor: temaAtual.cardHover }}
              transition={{ type: 'spring', stiffness: 300 }}
              onClick={() => setMenuAberto(!menuAberto)}
              className="text-2xl p-2 rounded-full"
              title="Abrir configurações"
              style={{
                color: temaAtual.texto,
                backgroundColor: temaAtual.card,
              }}
            >
              <FaCog />
            </motion.button>

            <AnimatePresence>
              {menuAberto && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-[calc(100%+10px)] right-0 flex flex-col items-center gap-2 z-50"
                >
                  {botoes.map((btn, idx) => (
                    <motion.button
                      whileHover={{ scale: 1.15, backgroundColor: temaAtual.cardHover }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      key={idx}
                      onClick={() => {
                        btn.action();
                        setMenuAberto(false);
                      }}
                      className="w-10 h-10 rounded-full flex items-center justify-center border"
                      title={btn.title}
                      style={{
                        backgroundColor: temaAtual.card,
                        color: temaAtual.texto,
                        borderColor: temaAtual.destaque,
                      }}
                    >
                      {btn.icon}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={() => {}} // Avatar só é atualizado via cadastro
        className="hidden"
      />
    </header>
  );
};

export default Header;
