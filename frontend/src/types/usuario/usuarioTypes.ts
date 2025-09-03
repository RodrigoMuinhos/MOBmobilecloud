

export type Usuario = {
  id?: string;
  nome: string;
  cpf: string;
  senha: string;
  tipo: 'adm' | 'filiado' | 'vendedor';
  filialId: string | null;
  email?: string;
  cidade?: string;
  nascimento?: string;
  whatsapp?: string;
  avatar?: string | null;
};
