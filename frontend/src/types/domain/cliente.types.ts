export type Cliente = {
  id: string;
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
  criadoEm: string;
  atualizadoEm?: string;
  sincronizado?: boolean;
  incompleto?: boolean;
  uf: string;
  vendedorId?: string;
};

export function clienteVazio(): Cliente {
  return {
    id: '',
    nome: '',
    cpf: '',
    whatsapp: '',
    endereco: '',
    cep: '',
    estado: '',
    uf: '',
    nascimento: '',
    criadoEm: new Date().toISOString(),
  };
}