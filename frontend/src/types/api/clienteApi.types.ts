// types/api/clienteApi.types.ts

import { Cliente } from '../../types/domain/cliente.types';

export interface ClienteAPI {
  id?: string;
  nome: string;
  cpf: string;
  whatsapp: string;
  email?: string;
  endereco: string;
  cep: string;
  bairro?: string;
  cidade?: string;
  estado?: string;
  numero?: string;
  complemento?: string;
  nascimento?: string;
  genero?: string;
  profissao?: string;
  empresa?: string;
  criadoEm?: string;
  atualizadoEm?: string;
  sincronizado?: boolean;
  incompleto?: boolean;
  uf: string;
  vendedorId?: string;
}

export type CriarClientePayload = Omit<Cliente, 'id' | 'criadoEm' | 'atualizadoEm'>;

export type AtualizarClientePayload = Partial<CriarClientePayload> & { id: string };
