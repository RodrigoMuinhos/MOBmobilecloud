export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  tipo: 'admin' | 'vendedor' | 'filial';
  avatar?: string;
};
