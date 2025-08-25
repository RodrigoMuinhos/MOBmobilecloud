import React, { useEffect, useState } from 'react';
import api from '../services/api';

type Cliente = {
  nome: string;
  cpf: string;
};

const ClientesPage: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    api.get('/clientes')
      .then(response => setClientes(response.data))
      .catch(error => console.error('Erro ao buscar clientes:', error));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#336021] mb-4">Lista de Clientes</h1>
      {clientes.length === 0 ? (
        <p>Nenhum cliente encontrado.</p>
      ) : (
        <ul className="space-y-3">
          {clientes.map((cliente, index) => (
            <li key={index} className="p-4 bg-white rounded shadow">
              <strong>Nome:</strong> {cliente.nome} <br />
              <strong>CPF:</strong> {cliente.cpf}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ClientesPage;