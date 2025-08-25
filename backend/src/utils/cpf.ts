// src/utils/cpf.ts
export const stripCPF = (cpf: string = '') => cpf.replace(/\D/g, '').slice(0, 11);

export function validarCPF(cpf: string): boolean {
  cpf = stripCPF(cpf);
  if (!cpf || cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let soma = 0;
  for (let i = 0; i < 9; i++) soma += parseInt(cpf.charAt(i)) * (10 - i);
  let resto = 11 - (soma % 11);
  const digito1 = resto === 10 || resto === 11 ? 0 : resto;

  soma = 0;
  for (let i = 0; i < 10; i++) soma += parseInt(cpf.charAt(i)) * (11 - i);
  resto = 11 - (soma % 11);
  const digito2 = resto === 10 || resto === 11 ? 0 : resto;

  return digito1 === parseInt(cpf.charAt(9)) && digito2 === parseInt(cpf.charAt(10));
}

export function formatarCPF(cpf: string): string {
  const v = stripCPF(cpf);
  if (v.length !== 11) return cpf;
  return v.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}
