'use client';
import React from 'react';
import { Cliente } from '../../../../types/domain/cliente.types';
import { FaPlus } from 'react-icons/fa';
import { useTheme } from '../../../../context/ThemeContext';
import { useLanguage } from '../../../../context/LanguageContext';
import api from '../../../../services/api';

interface Props {
  cliente: Cliente;
}

const BotaoSalvarCliente: React.FC<Props> = ({ cliente }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.clientes;

  const handleSalvar = async () => {
    const nome = cliente?.nome?.trim();
    const cpf = cliente?.cpf?.replace(/\D/g, '').trim();

    if (!nome || !cpf) {
      alert(t.alertPreenchaCampos || '⚠️ Preencha nome e CPF para salvar.');
      return;
    }

const clienteParaSalvar: Partial<Cliente> = {
  ...(cliente.id?.length === 36 ? { id: cliente.id } : {}),
  nome,
  cpf: cliente.cpf.replace(/\D/g, ''),
  whatsapp: cliente.whatsapp || '',
  endereco: cliente.endereco || '',
  cep: cliente.cep || '',
  estado: cliente.estado || '',
  nascimento: cliente.nascimento?.trim() || undefined, // ✅ aqui está corrigido
  uf: cliente.uf || cliente.estado || '',
  cidade: cliente.cidade || 'Fortaleza',
};



    try {
      const response = await api.post('/clientes', clienteParaSalvar);

      if (response.status === 201 || response.status === 200) {
        alert(t.alertSalvo || '✅ Cliente salvo com sucesso!');
        // opcional: setCliente(clienteVazio); ← se quiser resetar depois
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert(t.alertClienteExiste || '👤 Cliente com esse CPF já está cadastrado.');
      } else {
        alert(t.alertErro || '❌ Erro ao salvar cliente. Verifique a conexão.');
        console.error('Erro ao salvar cliente:', error);
      }
    }
  };

  return (
    <button
      onClick={handleSalvar}
      className="w-10 h-10 flex items-center justify-center rounded-full border-2 transition hover:scale-110"
      style={{
        borderColor: temaAtual.destaque,
        color: temaAtual.destaque,
      }}
      title={t.salvar || 'Salvar cliente'}
    >
      <FaPlus />
    </button>
  );
};

export default BotaoSalvarCliente;
