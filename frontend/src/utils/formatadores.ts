export const formatarTelefone = (numero: string): string => {
  const digitos = numero.replace(/\D/g, '');
  if (digitos.length === 11) return `(${digitos.slice(0, 2)}) ${digitos[2]} ${digitos.slice(3, 7)}-${digitos.slice(7)}`;
  if (digitos.length === 10) return `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  return numero;
};

export const formatarCNPJ = (cnpj: string | number | null | undefined): string => {
  if (!cnpj) return '-';
  const c = cnpj.toString().replace(/\D/g, '');
  if (c.length !== 14) return cnpj.toString();
  return `${c.slice(0, 2)}.${c.slice(2, 5)}.${c.slice(5, 8)}/${c.slice(8, 12)}-${c.slice(12)}`;
};
export const formatarData = (data: string | Date): string => {
  const dataObj = typeof data === 'string' ? new Date(data) : data;
  return dataObj.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const obterNomeCliente = (cliente: any) =>
  cliente.nomeTitular || cliente.nome_titular || cliente.nomeFantasia || cliente.nome_fantasia || '-';