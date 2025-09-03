// src/features/usuarios/pages/PreLoginScreen.tsx

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUser, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../services/api';
import { TipoUsuario } from '../../../context/AuthContext';

interface Usuario {
  id?: string;
  nome: string;
  tipo: string;
  avatar: string | null;
}

type PreLoginScreenProps = {
  /** Chamado quando o usuário decide continuar ou quando trocamos de usuário */
  onContinuar?: () => void;
};

const PreLoginScreen: React.FC<PreLoginScreenProps> = ({ onContinuar }) => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const localUserRaw = localStorage.getItem('USUARIO_ATUAL');
    const localUser = localUserRaw ? JSON.parse(localUserRaw) : {};

    // logout forçado
    const forcarLogout = localStorage.getItem('FORCAR_LOGOUT');
    if (forcarLogout === 'true') {
      localStorage.removeItem('FORCAR_LOGOUT');
      trocarUsuario();
      return;
    }

    if (!localUser?.id) {
      // fallback se não houver ID salvo
      trocarUsuario();
      return;
    }

    const carregarUsuario = async () => {
      try {
        const res = await api.get(`/usuarios/${localUser.id}`);
        setUsuario(res.data);
      } catch (error) {
        console.error('Erro ao buscar usuário:', error);
        trocarUsuario(); // força logout se não encontrado
      } finally {
        setCarregando(false);
      }
    };

    carregarUsuario();

    const handleEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') executarLogin();
    };
    window.addEventListener('keydown', handleEnter);
    return () => window.removeEventListener('keydown', handleEnter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executarLogin = () => {
    if (!usuario) return;

    const tipo = usuario.tipo;
    const tiposValidos: TipoUsuario[] = ['adm', 'vendedor', 'filiado'];
    if (tiposValidos.includes(tipo as TipoUsuario)) {
      login(tipo as TipoUsuario);
      // opcional: preservar USUARIO_ATUAL/TIPO_USUARIO aqui se necessário
      onContinuar?.();     // informa o pai para esconder a PreLogin
      navigate('/');       // segue para a home
    }
  };

  const trocarUsuario = () => {
    localStorage.removeItem('LOGIN_LEMBRADO');
    localStorage.removeItem('USUARIO_ATUAL');
    localStorage.removeItem('TIPO_USUARIO');
    onContinuar?.();       // informa o pai para esconder a PreLogin
    navigate('/login');    // vai para tela de login
  };

  const nome = usuario?.nome || 'Usuário';
  const avatar = usuario?.avatar;
  const primeiroNome = nome.split(' ')[0];

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-xl">
        Carregando dados do usuário...
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative px-4"
      style={{
        backgroundImage: 'url(/loginback/transparencia.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backdropFilter: 'blur(60px)',
        backgroundColor: 'rgba(0,0,0,0.8)',
      }}
    >
      <button
        onClick={trocarUsuario}
        className="absolute top-6 right-6 flex items-center gap-2 text-white hover:text-orange-400"
        title="Trocar de usuário"
      >
        <FaSignOutAlt className="text-xl" />
        <span className="hidden md:inline">Trocar Usuário</span>
      </button>

      <div className="w-56 h-56 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl mb-8 border-4 border-orange-300">
        {avatar ? (
          <img
            src={avatar}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover opacity-90"
          />
        ) : (
          <FaUser className="text-[120px] text-orange-300 opacity-70" />
        )}
      </div>

      <h1 className="text-white text-3xl mb-6">
        Olá, <span className="font-bold text-orange-400">{primeiroNome}</span>
      </h1>

      <button
        onClick={executarLogin}
        className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl text-lg font-semibold shadow-lg transition"
      >
        Entrar
      </button>
    </div>
  );
};

export default PreLoginScreen;
