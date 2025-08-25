'use client';
import React from 'react';
import { Cliente } from '../../../types/domain/cliente.types';
import { useLanguage } from '../../../context/LanguageContext';
import { formatarData } from '../../../utils/formatadores';

interface Props {
  cliente: Cliente | null;
  onClose: () => void;
  vendasTotalPorCpf: Record<string, number>;
  temaAtual: {
    card: string;
    texto: string;
    destaque: string;
  };
}

const ModalCliente: React.FC<Props> = ({
  cliente,
  onClose,
  temaAtual,
  vendasTotalPorCpf,
}) => {
  const { language } = useLanguage();
  if (!cliente) return null;

  const totalComprado = vendasTotalPorCpf[cliente.cpf] ?? 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div
        className="rounded-lg shadow-lg p-6 max-w-md w-full border"
        style={{
          backgroundColor: temaAtual.card,
          color: temaAtual.texto,
          borderColor: temaAtual.destaque,
          borderWidth: '1px',
        }}
      >
        <h3 className="text-xl font-bold mb-4">
          {language.ficha?.titulo ?? 'Informações do Cliente'}
        </h3>

        <div className="space-y-2 text-sm">
          <p>
            <strong>{language.ficha?.nome ?? 'Nome'}:</strong> {cliente.nome}
          </p>
          <p>
            <strong>{language.ficha?.cpf ?? 'CPF'}:</strong> {cliente.cpf}
          </p>
          <p>
            <strong>{language.ficha?.whatsapp ?? 'WhatsApp'}:</strong> {cliente.whatsapp ?? '—'}
          </p>
          {cliente.email && (
            <p>
              <strong>{language.ficha?.email ?? 'Email'}:</strong> {cliente.email}
            </p>
          )}
          {cliente.endereco && (
            <p>
              <strong>{language.ficha?.endereco ?? 'Endereço'}:</strong> {cliente.endereco}
            </p>
          )}
          {cliente.cep && (
            <p>
              <strong>{language.ficha?.cep ?? 'CEP'}:</strong> {cliente.cep}
            </p>
          )}
          {cliente.nascimento && (
            <p>
              <strong>{language.ficha?.nascimento ?? 'Nascimento'}:</strong>{' '}
              {formatarData(cliente.nascimento)}
            </p>
          )}
          <p className="mt-2">
            <strong>{language.ficha?.totalComprado ?? 'Total Comprado'}:</strong>{' '}
            R$ {totalComprado.toFixed(2)}
          </p>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            {language.ficha?.fechar ?? 'Fechar'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalCliente;
