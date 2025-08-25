// src/utils/normalizers.ts
export const onlyDigits = (v: string = '') => v.replace(/\D/g, '');

export const normalizeCPF = (cpf: string = '') => onlyDigits(cpf).slice(0, 11);

export const normalizeCEP = (cep: string = '') => onlyDigits(cep).slice(0, 8);

export const normalizeWhatsapp = (w: string = '') => onlyDigits(w).slice(0, 11);

export const normalizeName = (name: string = '') =>
  name.toLowerCase().replace(/(?:^|\s)\S/g, (l) => l.toUpperCase());
