// src/features/usuarios/pages/GerenciarUsuariosPage.tsx

import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../../services/api';

interface Usuario {
  id: string;
  nome: string;
  login: string;
  senha: string;
  tipo: 'filiado' | 'vendedor';
}

const GerenciarUsuariosPage: React.FC = () => {
  const { tipoUsuario } = useAuth();
  const navigate = useNavigate();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [form, setForm] = useState<Partial<Usuario>>({});
  const [editandoId, setEditandoId] = useState<string | null>(null);

  useEffect(() => {
    if (tipoUsuario !== 'adm') navigate('/');
    carregarUsuarios();
  }, [tipoUsuario]);

  const carregarUsuarios = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (error) {
      console.error('Erro ao carregar usuários', error);
    }
  };

  const handleSubmit = async () => {
    if (!form.nome || !form.login || !form.senha || !form.tipo) return;

    try {
      if (editandoId) {
        await api.put(`/usuarios/${editandoId}`, form);
      } else {
        await api.post('/usuarios', form);
      }
      setForm({});
      setEditandoId(null);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao salvar usuário', error);
    }
  };

  const handleEditar = (usuario: Usuario) => {
    setForm(usuario);
    setEditandoId(usuario.id);
  };

  const handleExcluir = async (id: string) => {
    try {
      await api.delete(`/usuarios/${id}`);
      carregarUsuarios();
    } catch (error) {
      console.error('Erro ao excluir usuário', error);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Gerenciar Usuários</h1>

      <div className="bg-white shadow rounded p-4 mb-6">
        <h2 className="text-lg font-semibold mb-2">{editandoId ? 'Editar Usuário' : 'Novo Usuário'}</h2>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nome"
            value={form.nome || ''}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="text"
            placeholder="Login"
            value={form.login || ''}
            onChange={(e) => setForm({ ...form, login: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <input
            type="password"
            placeholder="Senha"
            value={form.senha || ''}
            onChange={(e) => setForm({ ...form, senha: e.target.value })}
            className="border rounded px-3 py-2"
          />
          <select
            value={form.tipo || ''}
            onChange={(e) => setForm({ ...form, tipo: e.target.value as 'filiado' | 'vendedor' })}
            className="border rounded px-3 py-2"
          >
            <option value="">Tipo de usuário</option>
            <option value="filiado">Filiado</option>
            <option value="vendedor">Vendedor</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          {editandoId ? 'Salvar Alterações' : 'Cadastrar Usuário'}
        </button>
      </div>

      <div className="bg-white shadow rounded p-4">
        <h2 className="text-lg font-semibold mb-2">Usuários Cadastrados</h2>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="py-2">Nome</th>
              <th>Login</th>
              <th>Tipo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-b">
                <td className="py-1">{u.nome}</td>
                <td>{u.login}</td>
                <td className="capitalize">{u.tipo}</td>
                <td className="space-x-2">
                  <button
                    onClick={() => handleEditar(u)}
                    className="text-blue-600 hover:underline"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleExcluir(u.id)}
                    className="text-red-600 hover:underline"
                  >
                    Excluir
                  </button>
                </td>
              </tr>
            ))}
            {usuarios.length === 0 && (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">Nenhum usuário cadastrado.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GerenciarUsuariosPage;
