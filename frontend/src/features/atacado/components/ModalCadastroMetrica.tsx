'use client';

import React, { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

type Simulacao = {
  id: string;
  nome: string;
  studio: string;
  cpfCnpj: string;
  endereco: string;
  tipo: 'Consignado' | 'Pré-venda';
  valorInvestido: number;
  data: string;
};

interface Props {
  onClose: () => void;
  valorInvestido: number;
  onSalvar: (simulacao: Simulacao) => void;
  simulacaoParaEditar?: Simulacao;
}

const ModalCadastroMetrica: React.FC<Props> = ({
  onClose,
  valorInvestido,
  onSalvar,
  simulacaoParaEditar,
}) => {
  const [nome, setNome] = useState('');
  const [studio, setStudio] = useState('');
  const [documento, setDocumento] = useState('');
  const [endereco, setEndereco] = useState('');
  const [tipo, setTipo] = useState<'consignado' | 'pre-venda' | ''>('');

  useEffect(() => {
    if (simulacaoParaEditar) {
      setNome(simulacaoParaEditar.nome);
      setStudio(simulacaoParaEditar.studio);
      setDocumento(simulacaoParaEditar.cpfCnpj);
      setEndereco(simulacaoParaEditar.endereco);
      setTipo(
        simulacaoParaEditar.tipo === 'Consignado' ? 'consignado' :
        simulacaoParaEditar.tipo === 'Pré-venda' ? 'pre-venda' : ''
      );
    }
  }, [simulacaoParaEditar]);

  const validarDocumento = (doc: string): boolean => {
    const clean = doc.replace(/\D/g, '');
    return clean.length === 11 || clean.length === 14;
  };

  const handleSalvar = () => {
    if (!nome || !documento || !tipo) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }

    if (!validarDocumento(documento)) {
      alert('CPF ou CNPJ inválido.');
      return;
    }

    const metrica: Simulacao = {
      id: simulacaoParaEditar?.id || uuidv4(),
      nome,
      studio,
      cpfCnpj: documento,
      endereco,
      tipo: tipo === 'consignado' ? 'Consignado' : 'Pré-venda',
      valorInvestido,
      data: simulacaoParaEditar?.data || new Date().toLocaleDateString('pt-BR'),
    };

    onSalvar(metrica);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg space-y-4">
        <h2 className="text-xl font-bold text-center">
          {simulacaoParaEditar ? 'Editar Métrica' : 'Cadastro de Vendedor'}
        </h2>

        <input
          type="text"
          placeholder="Nome completo"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Nome do Studio"
          value={studio}
          onChange={(e) => setStudio(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="CPF ou CNPJ"
          value={documento}
          onChange={(e) => setDocumento(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <input
          type="text"
          placeholder="Endereço completo"
          value={endereco}
          onChange={(e) => setEndereco(e.target.value)}
          className="w-full border p-2 rounded"
        />

        <div className="flex justify-between items-center gap-4 mt-2">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="consignado"
              checked={tipo === 'consignado'}
              onChange={() => setTipo('consignado')}
            />
            Consignado
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="tipo"
              value="pre-venda"
              checked={tipo === 'pre-venda'}
              onChange={() => setTipo('pre-venda')}
            />
            Pré-venda
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={handleSalvar}
            className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            {simulacaoParaEditar ? 'Atualizar' : 'Salvar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCadastroMetrica;