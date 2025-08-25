import type { Cliente } from '../../types/domain/cliente.types';
import type { ClienteAPI } from '../../types/api/clienteApi.types';

export function normalizarClienteAPI(cliente: Partial<ClienteAPI>): Cliente {
  return {
    id: cliente.id ?? '',
    nome: cliente.nome ?? '',
    cpf: cliente.cpf ?? '',
    whatsapp: cliente.whatsapp ?? '',
    email: cliente.email ?? '',
    endereco: cliente.endereco ?? '',
    cep: cliente.cep ?? '',
    bairro: cliente.bairro ?? '',
    cidade: cliente.cidade ?? '',
    estado: cliente.estado ?? '',
    numero: cliente.numero ?? '',
    complemento: cliente.complemento ?? '',
    nascimento: cliente.nascimento ?? '',
    genero: cliente.genero ?? '',
    profissao: cliente.profissao ?? '',
    empresa: cliente.empresa ?? '',
    criadoEm: cliente.criadoEm ?? '',
    atualizadoEm: cliente.atualizadoEm ?? '',
    sincronizado: cliente.sincronizado ?? false,
    incompleto: cliente.incompleto ?? false,
    uf: cliente.uf ?? '',
    vendedorId: cliente.vendedorId ?? '',
  };
}
