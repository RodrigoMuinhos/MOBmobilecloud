// /types/api/usuarioApi.types.ts

export interface UsuarioAPI {
  id?: string;
  nome: string;
  email: string;
  senha?: string; // Pode ser omitido em listagens

  tipo: 'admin' | 'vendedor' | 'filial';

  avatar?: string;
  criadoEm?: string;
  atualizadoEm?: string;
}
