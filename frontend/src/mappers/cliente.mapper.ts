// mappers/cliente.mapper.ts
import { Cliente } from '../types/domain/cliente.types';
import { ClienteAPI } from '../types/api/clienteApi.types';

export function mapClienteApiToDomain(api: ClienteAPI): Cliente {
  return {
    id: api.id ?? '',
    nome: api.nome ?? '',
    cpf: api.cpf ?? '',
    whatsapp: api.whatsapp ?? '',
    email: api.email ?? '',
    endereco: api.endereco ?? '',
    cep: api.cep ?? '',
    bairro: api.bairro ?? '',
    cidade: api.cidade ?? '',
    estado: api.estado ?? '',
    numero: api.numero ?? '',
    complemento: api.complemento ?? '',
    nascimento: api.nascimento ?? '',
    genero: api.genero ?? '',
    profissao: api.profissao ?? '',
    empresa: api.empresa ?? '',
    criadoEm: api.criadoEm ?? '',
    atualizadoEm: api.atualizadoEm ?? '',
    sincronizado: api.sincronizado ?? true,
    incompleto: api.incompleto ?? false,
    uf: api.uf ?? '',
    vendedorId: api.vendedorId ?? '',
  };
}


export function mapClienteDomainToApi(domain: Cliente): ClienteAPI {
  return {
    id: domain.id,
    nome: domain.nome,
    cpf: domain.cpf,
    whatsapp: domain.whatsapp,
    email: domain.email,
    endereco: domain.endereco,
    cep: domain.cep,
    bairro: domain.bairro,
    cidade: domain.cidade,
    estado: domain.estado,
    numero: domain.numero,
    complemento: domain.complemento,
    nascimento: domain.nascimento,
    genero: domain.genero,
    profissao: domain.profissao,
    empresa: domain.empresa,
    criadoEm: domain.criadoEm,
    atualizadoEm: domain.atualizadoEm,
    sincronizado: domain.sincronizado,
    incompleto: domain.incompleto,
    uf: domain.uf,
    vendedorId: domain.vendedorId,
  };
}
