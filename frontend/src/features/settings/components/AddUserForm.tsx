import React, { useState } from 'react';

const AddUserForm: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [tipo, setTipo] = useState('vendedor');

  const handleAddUser = () => {
    const usuarios = JSON.parse(localStorage.getItem('usuariosCadastrados') || '{}');

    if (usuarios[usuario.toLowerCase()]) {
      alert('Usuário já existe. Escolha outro nome.');
      return;
    }

    usuarios[usuario.toLowerCase()] = { senha, tipo };
    localStorage.setItem('usuariosCadastrados', JSON.stringify(usuarios));
    alert('Usuário cadastrado com sucesso!');

    setUsuario('');
    setSenha('');
    setTipo('vendedor');
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Nome de usuário"
        value={usuario}
        onChange={(e) => setUsuario(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />

      <select
        value={tipo}
        onChange={(e) => setTipo(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      >
        <option value="vendedor">Vendedor</option>
        <option value="filiado">Filiado</option>
        <option value="adm">Administrador</option>
      </select>

      <button
        onClick={handleAddUser}
        className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
      >
        Cadastrar
      </button>
    </div>
  );
};

export default AddUserForm;
