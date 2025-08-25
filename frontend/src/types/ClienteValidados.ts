// src/types/ClienteValidados.ts

export type Telefone = {
  numero: string;
  msgCheck: boolean;
   checkExtra?: boolean; 
};


export type Cliente = {
  cnpj: string | number;
  nomeFantasia?: string | null;
  nomeTitular?: string | null;
  distrito?: string | null;
  uf?: string | null;
  telefone?: Telefone[];
  validado?: string | null;
};