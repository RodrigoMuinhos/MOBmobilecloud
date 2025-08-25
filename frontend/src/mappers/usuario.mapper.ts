import { UsuarioAPI } from '../types/api/usuarioApi.types';
import { Usuario } from '../types/domain/usuario.types';

/**
 * Converte um usuário da API para o formato usado no frontend.
 */
export function mapUsuarioApiToDomain(api: UsuarioAPI): Usuario {
  return {
    id: api.id ?? '',
    nome: api.nome ?? '',
    email: api.email ?? '',
    senha: api.senha ?? '',
    tipo: tipoValido(api.tipo),
    avatar: api.avatar ?? '',
  };
}

/**
 * Converte um usuário do frontend para o formato da API.
 */
export function mapUsuarioDomainToApi(domain: Usuario): UsuarioAPI {
  return {
    id: domain.id,
    nome: domain.nome,
    email: domain.email,
    senha: domain.senha,
    tipo: domain.tipo,
    avatar: domain.avatar ?? '',
  };
}

/**
 * Valida e converte o tipo de usuário para o formato seguro.
 */
function tipoValido(tipo: string | undefined): 'admin' | 'vendedor' | 'filial' {
  if (tipo === 'admin' || tipo === 'vendedor' || tipo === 'filial') {
    return tipo;
  }
  return 'vendedor'; // fallback padrão
}
