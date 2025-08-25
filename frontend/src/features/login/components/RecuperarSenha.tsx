import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Usuario {
  nome: string;
  senha: string;
  tipo: string;
  cidade: string;
  cpf: string;
  nascimento: string;
  whatsapp: string;
  email: string;
  avatar: string | null;
}

const RecuperarSenha: React.FC = () => {
  const navigate = useNavigate();

  const [etapa, setEtapa] = useState(1);
  const [identificador, setIdentificador] = useState('');
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  const [nascimento, setNascimento] = useState('');
  const [cidade, setCidade] = useState('');
  const [erro, setErro] = useState('');

  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  const buscarUsuario = () => {
    const usuariosSalvos: Usuario[] = JSON.parse(localStorage.getItem('USUARIOS_SISTEMA') || '[]');
    const encontrado = usuariosSalvos.find(
      (u) =>
        u.cpf === identificador || u.email?.toLowerCase() === identificador.toLowerCase()
    );

    if (encontrado) {
      setUsuario(encontrado);
      setEtapa(2);
      setErro('');
    } else {
      setErro('Usuário não encontrado');
    }
  };

  const validarDadosSensiveis = () => {
    if (usuario?.nascimento === nascimento && usuario?.cidade === cidade) {
      setErro('');
      setEtapa(3);
    } else {
      setErro('Dados não conferem');
    }
  };

  const redefinirSenha = () => {
    if (novaSenha !== confirmarSenha) {
      setErro('As senhas não coincidem');
      return;
    }

    if (usuario) {
      const usuariosSalvos: Usuario[] = JSON.parse(localStorage.getItem('USUARIOS_SISTEMA') || '[]');
      const atualizados = usuariosSalvos.map((u) =>
        u.cpf === usuario.cpf ? { ...u, senha: novaSenha } : u
      );
      localStorage.setItem('USUARIOS_SISTEMA', JSON.stringify(atualizados));
      alert('Senha redefinida com sucesso!');
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-700 px-4">
      <div className="bg-white/10 backdrop-blur-md rounded-xl shadow-xl w-full max-w-md p-6 border border-white/10">
        <h2 className="text-xl text-white font-bold text-center mb-6">Recuperar Senha</h2>

        {etapa === 1 && (
          <>
            <label className="text-white mb-2 block">Digite seu CPF ou Email:</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-white/90 mb-4"
              placeholder="CPF ou email"
              value={identificador}
              onChange={(e) => setIdentificador(e.target.value)}
            />
            {erro && <p className="text-red-400 text-sm mb-2">{erro}</p>}
            <button
              onClick={buscarUsuario}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded"
            >
              Avançar
            </button>
          </>
        )}

        {etapa === 2 && (
          <>
            <label className="text-white block mb-1">Data de nascimento</label>
            <input
              type="date"
              className="w-full p-2 rounded bg-white/90 mb-3"
              value={nascimento}
              onChange={(e) => setNascimento(e.target.value)}
            />
            <label className="text-white block mb-1">Cidade (Estado)</label>
            <input
              type="text"
              className="w-full p-2 rounded bg-white/90 mb-3"
              value={cidade}
              onChange={(e) => setCidade(e.target.value)}
            />
            {erro && <p className="text-red-400 text-sm mb-2">{erro}</p>}
            <button
              onClick={validarDadosSensiveis}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded"
            >
              Validar dados
            </button>
          </>
        )}

        {etapa === 3 && (
          <>
            <label className="text-white block mb-1">Nova senha</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-white/90 mb-3"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
            <label className="text-white block mb-1">Confirmar nova senha</label>
            <input
              type="password"
              className="w-full p-2 rounded bg-white/90 mb-3"
              value={confirmarSenha}
              onChange={(e) => setConfirmarSenha(e.target.value)}
            />
            {erro && <p className="text-red-400 text-sm mb-2">{erro}</p>}
            <button
              onClick={redefinirSenha}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 rounded"
            >
              Redefinir senha
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default RecuperarSenha;
