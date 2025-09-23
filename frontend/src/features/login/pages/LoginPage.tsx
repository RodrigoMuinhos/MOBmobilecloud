// src/features/usuarios/pages/LoginPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaLock, FaUser } from 'react-icons/fa';
import { useAuth, TipoUsuario } from '../../../context/AuthContext';
import api from '../../../services/api';

interface Usuario {
  nome: string;
  senha: string;
  tipo: TipoUsuario;
  cidade: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  email: string;
  avatar: string | null;
}

const aplicarMascaraCPF = (valor: string): string => {
  const digitos = valor.replace(/\D/g, '').slice(0, 11);
  if (digitos.length <= 3) return digitos;
  if (digitos.length <= 6) return digitos.replace(/(\d{3})(\d+)/, '$1.$2');
  if (digitos.length <= 9) return digitos.replace(/(\d{3})(\d{3})(\d+)/, '$1.$2.$3');
  return digitos.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
};

const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [identificador, setIdentificador] = useState('');
  const [senha, setSenha] = useState('');
  const [lembrar, setLembrar] = useState(false);
  const [erro, setErro] = useState('');

  const handleLogin = async () => {
    const id = identificador.trim();
    const pwd = senha.trim();

    // ADMIN FIXO LOCAL
    if (id.replace(/\D/g, '') === '04411750317' && pwd === 'rodrigo123') {
      const admin: Usuario = {
        nome: 'Administrador Fixo',
        senha: 'rodrigo123',
        tipo: 'adm',
        cidade: 'Sistema',
        cpf: '04411750317',
        nascimento: '',
        whatsapp: '',
        email: 'admin@mobsupply.com',
        avatar: null,
      };
      localStorage.setItem('USUARIO_ATUAL', JSON.stringify(admin));
      localStorage.setItem('TIPO_USUARIO', 'adm');
      if (lembrar) localStorage.setItem('LOGIN_LEMBRADO', JSON.stringify({ id, senha: pwd }));
      else localStorage.removeItem('LOGIN_LEMBRADO');
      login('adm');
      navigate('/');
      return;
    }

    // LOGIN VIA API
    try {
      const res = await api.post('/usuarios/login', {
        identificador: id,
        senha: pwd,
      });

      const { usuario, tipo, token } = res.data;

      localStorage.setItem('USUARIO_ATUAL', JSON.stringify(usuario));
      localStorage.setItem('TIPO_USUARIO', tipo);
      localStorage.setItem('TOKEN_MOB', token);

      if (lembrar) {
        localStorage.setItem('LOGIN_LEMBRADO', JSON.stringify({ id, senha: pwd }));
      } else {
        localStorage.removeItem('LOGIN_LEMBRADO');
      }

      login(tipo);
      navigate('/');
    } catch (err) {
      console.error(err);
      setErro('CPF ou Email e senha não conferem');
    }
  };

  const handleIdentificadorChange = (valor: string) => {
    const soNumeros = valor.replace(/\D/g, '');
    if (soNumeros.length <= 11 && /^\d+$/.test(soNumeros)) {
      setIdentificador(aplicarMascaraCPF(valor));
    } else {
      setIdentificador(valor);
    }
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center relative"
      style={{
        backgroundImage: "url('/loginback/transparencia.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[14px] z-0" />

      <div className="relative z-10 flex flex-col items-center px-6">
        <div className="w-64 h-64 rounded-full bg-white/10 backdrop-blur-2xl flex items-center justify-center shadow-2xl -mt-32 mb-4">
          <FaUser className="text-orange-300/40 text-[8rem]" />
        </div>

        <h1 className="text-white text-2xl font-semibold mb-6 drop-shadow">
          Bem-vindo ao <span className="text-orange-400">MOBsupply</span>
        </h1>

        <div className="relative mb-5 w-full max-w-md">
          <FaUser className="absolute top-4 left-4 text-gray-300" />
          <input
            type="text"
            placeholder="Email ou CPF"
            value={identificador}
            onChange={(e) => handleIdentificadorChange(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-white/20 text-white backdrop-blur-md placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="relative mb-5 w-full max-w-md">
          <FaLock className="absolute top-4 left-4 text-gray-300" />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 rounded-lg bg-white/20 text-white backdrop-blur-md placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-400"
          />
        </div>

        <div className="w-full max-w-md flex flex-col sm:flex-row sm:justify-between sm:items-center text-sm text-gray-200 mb-5 gap-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={lembrar}
              onChange={(e) => setLembrar(e.target.checked)}
              className="accent-orange-500"
            />
            <span>Lembrar de mim</span>
          </label>
          <button
            onClick={() => navigate('/recuperar-senha')}
            className="text-orange-400 hover:underline text-right"
          >
            Esqueci minha senha
          </button>
        </div>

        {erro && <p className="text-red-500 text-sm text-center mb-4">{erro}</p>}

        <button
          onClick={handleLogin}
          className="w-full max-w-md bg-orange-500 hover:bg-orange-600 text-white py-2.5 rounded-lg font-semibold transition"
        >
          Entrar
        </button>
      </div>
    </div>
  );
};

export default LoginPage;