export interface Usuario {
  id?: string;
  nome: string;
  email?: string; // deixe opcional se o back permitir vazio
  tipo: 'adm' | 'filiado' | 'vendedor';
  senha: string;
  cidade?: string;
  cpf: string;
  nascimento?: string;  // ISO de preferência
  whatsapp?: string;
  avatar?: string | null;
}
