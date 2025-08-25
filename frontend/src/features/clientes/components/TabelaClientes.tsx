'use client';
import React from 'react';
import { Cliente } from '../../../types/domain/cliente.types';
import { useLanguage } from '../../../context/LanguageContext';
import { FaFilePdf, FaTrash } from 'react-icons/fa';
import api from '../../../services/api';

interface Props {
  clientes: Cliente[];
  clientesFiltrados: Cliente[];
  clienteEditando: Cliente | null;
  clienteExpandidoIndex: number | null;
  setClienteEditando: (c: Cliente | null) => void;
  setClienteExpandidoIndex: (index: number | null) => void;
  exportarClienteParaPDF: (cliente: Cliente) => void;
  busca: string;
  setBusca: (value: string) => void;
  cpfsDuplicados: Set<string>;
  temaAtual: any;
  atualizarClientes: () => void;
}

const TabelaClientes: React.FC<Props> = ({
  clientesFiltrados,
  clienteExpandidoIndex,
  setClienteExpandidoIndex,
  exportarClienteParaPDF,
  busca,
  setBusca,
  cpfsDuplicados,
  temaAtual,
  atualizarClientes,
}) => {
  const { currentLang, textos } = useLanguage();
  const t = textos[currentLang].clientes;

  const handleDeleteCliente = async (id: string) => {
    try {
      const confirmar = window.confirm('Deseja realmente excluir este cliente?');
      if (!confirmar) return;
      await api.delete(`/clientes/${id}`);
      atualizarClientes();
    } catch (error) {
      console.error('Erro ao deletar cliente:', error);
      alert('Erro ao excluir cliente.');
    }
  };

  return (
    <div>
      <input
        type="text"
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder={t?.busca || 'Buscar cliente'}
        className="w-full p-2 mb-4 border rounded"
        style={{ backgroundColor: temaAtual.input, color: temaAtual.texto }}
      />

      <table className="w-full border-collapse text-sm text-left">
        <thead>
          <tr style={{ backgroundColor: temaAtual.borda, color: temaAtual.texto }}>
            <th className="p-2">Nome</th>
            <th className="p-2">WhatsApp</th>
            <th className="p-2">Cidade-UF</th>
            <th className="p-2">CPF</th>
            <th className="p-2 text-center">Ações</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(clientesFiltrados) &&
            clientesFiltrados.map((cliente, index) => (
              <tr
                key={cliente.id}
                className="border-b"
                style={{
                  backgroundColor: index % 2 === 0 ? temaAtual.card : temaAtual.fundo,
                  color: temaAtual.texto,
                }}
              >
                <td
                  className="p-2 font-medium"
                  style={{
                    color: cpfsDuplicados.has(cliente.cpf) ? 'red' : temaAtual.texto,
                  }}
                >
                  {cliente.nome}
                </td>
                <td className="p-2">{cliente.whatsapp}</td>
                <td className="p-2">
                  {cliente.cidade ?? '—'} - {cliente.estado ?? '—'}
                </td>
                <td className="p-2">{cliente.cpf}</td>
                <td className="p-2 text-center">
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => exportarClienteParaPDF(cliente)}
                      className="text-red-600 hover:text-red-800"
                      title="Exportar para PDF"
                    >
                      <FaFilePdf size={18} />
                    </button>

                    <button
                      onClick={() => handleDeleteCliente(cliente.id)}
                      className="text-gray-400 hover:text-red-500"
                      title="Excluir cliente"
                    >
                      <FaTrash size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelaClientes;
