export interface Produto {
  codigo: string;
  nome: string;
  marca: string;
  tipo: 'caixa' | '5un' | 'unidade';
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
  desconto?: number;
  cupom?: string;
}

export interface Cliente {
  nome: string;
  cpf: string;
  whatsapp?: string;
  endereco?: string;
  email?: string;
  cep?: string;
  nascimento?: string;
}

export interface Venda {
  numero: number;
  data: string;
  hora: string;
  cliente: Cliente;
  itens: Produto[];

  subtotal: number;
  desconto_aplicado: number;
  frete: number;
  total_final: number;

  forma_pagamento: string;
  destino_desconto: string;
  pago: boolean;
}

// ✅ Adicione isto ao final
export interface Membro {
  id: string;
  nome: string;
}
