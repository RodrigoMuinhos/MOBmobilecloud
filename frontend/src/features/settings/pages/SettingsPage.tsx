// src/features/settings/pages/SettingsPage.tsx

import React from 'react';
import ThemeSelector from '../components/ThemeSelector';
import LoginBackgroundUploader from '../components/LoginBackgroundUploader';
import AddUserForm from '../components/AddUserForm';
import { useNavigate } from 'react-router-dom';

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();

  // Limpa completamente os dados locais e volta ao login
  const resetarDados = () => {
    localStorage.clear();
    navigate('/login');
    setTimeout(() => window.location.reload(), 100);
  };

  // Sai apenas da conta atual e volta ao login inicial (sem lembrar usuário)
  const trocarUsuario = () => {
    localStorage.removeItem('LOGIN_LEMBRADO');
    localStorage.removeItem('USUARIO_ATUAL');
    localStorage.removeItem('tipoUsuario');
    navigate('/login');
    setTimeout(() => window.location.reload(), 100);
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10">
      <h1 className="text-3xl font-bold text-center text-orange-400">⚙️ Configurações do Sistema</h1>

      {/* Tema */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🎨 Escolha o Tema</h2>
        <ThemeSelector />
      </section>

      {/* Fundo da Tela de Login */}
      <section>
        <h2 className="text-xl font-semibold mb-2">🖼️ Personalizar Fundo da Tela de Login</h2>
        <LoginBackgroundUploader />
      </section>

      {/* Cadastrar novo usuário */}
      <section>
        <h2 className="text-xl font-semibold mb-2">👤 Cadastrar Novo Usuário</h2>
        <AddUserForm />
      </section>

      {/* Ações extras */}
      <section>
        <h2 className="text-xl font-semibold mb-2">📦 Ações Extras</h2>
        <div className="space-y-2">
          <button
            onClick={resetarDados}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
          >
            🧽 Resetar Dados Locais
          </button>

          <button
            onClick={() => alert('Função de exportação em breve')}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 w-full"
          >
            📤 Exportar JSON
          </button>

          <button
            onClick={() => alert('Função de importação em breve')}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
          >
            📥 Importar JSON da Matriz
          </button>

          <button
            onClick={trocarUsuario}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600 w-full"
          >
            🔄 Trocar de Usuário
          </button>
        </div>
      </section>
    </div>
  );
};

export default SettingsPage;
