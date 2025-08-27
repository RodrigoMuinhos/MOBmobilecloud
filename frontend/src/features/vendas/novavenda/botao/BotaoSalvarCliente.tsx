// src/features/vendas/components/botao/BotaoSalvarCliente.tsx
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

type ClientePayload = {
  id?: string;
  nome: string;
  cpf: string;                  // só dígitos
  whatsapp?: string | null;     // só dígitos ou null
  endereco?: string | null;
  cep?: string | null;          // só dígitos ou null
  estado?: string | null;
  cidade?: string | null;
  uf?: string | null;
  nascimento?: string | undefined; // ISO ou undefined
};

const BotaoSalvarCliente: React.FC<Props> = ({ cliente }) => {
  const { temaAtual } = useTheme();
  const { language } = useLanguage();
  const t = language.clientes;

  const soDigitos = (v?: string) => (v ? v.replace(/\D/g, '') : '');
  const toNull = (s?: string) => (s && s.trim() !== '' ? s.trim() : null);

  const montarPayloadCliente = (c: Cliente): ClientePayload => {
    const idValido = c.id && c.id.length === 36 ? c.id : undefined;

    const nascimentoISO =
      c.nascimento && c.nascimento.trim() !== ''
        ? new Date(c.nascimento).toISOString()
        : undefined;

    return {
      ...(idValido ? { id: idValido } : {}),
      nome: (c.nome || '').trim(),
      cpf: soDigitos(c.cpf),
      whatsapp: toNull(soDigitos(c.whatsapp)),
      endereco: toNull(c.endereco),
      cep: toNull(soDigitos(c.cep)),
      estado: toNull(c.estado),
      cidade: toNull(c.cidade),
      uf: toNull(c.uf || c.estado),
      nascimento: nascimentoISO, // undefined se vazio
    };
  };

  const handleSalvar = async () => {
    const nome = (cliente?.nome ?? '').trim();
    const cpf = soDigitos(cliente?.cpf);

    if (!nome || !cpf) {
      alert(t.alertPreenchaCampos || '⚠️ Preencha nome e CPF para salvar.');
      return;
    }

    const payload = montarPayloadCliente(cliente);

    try {
      const response = await api.post('/clientes', payload);

      if (response.status === 201 || response.status === 200) {
        alert(t.alertSalvo || '✅ Cliente salvo com sucesso!');
        // Se quiser limpar no pai, passe setCliente via props e resete lá.
      }
    } catch (error: any) {
      const status = error?.response?.status;
      const msg = error?.response?.data?.erro;

      if (status === 409) {
        alert(t.alertClienteExiste || '👤 Cliente com esse CPF já está cadastrado.');
      } else if (status === 400) {
        alert(msg || t.alertErro || '❌ Erro ao salvar cliente. Dados inválidos.');
      } else {
        alert(t.alertErro || '❌ Erro ao salvar cliente. Verifique a conexão.');
      }

      console.error('Erro ao salvar cliente:', error?.response?.data || error);
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
