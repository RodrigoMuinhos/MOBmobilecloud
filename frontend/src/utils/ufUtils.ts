import { mapaCidadesBase } from './ufPorCidade';

export function obterUFPelaCidade(cidade?: string): string {
  if (!cidade) return '';
  const nome = cidade.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  
  const mapaLocalStorage = localStorage.getItem('mapaCidades');
  const mapaExtra = mapaLocalStorage ? JSON.parse(mapaLocalStorage) : {};

  return mapaExtra[nome] || mapaCidadesBase[nome] || '';
}

export function aprenderCidadeUF(cidade: string, uf: string) {
  const nome = cidade.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const mapaLocalStorage = localStorage.getItem('mapaCidades');
  const mapaExtra = mapaLocalStorage ? JSON.parse(mapaLocalStorage) : {};

  mapaExtra[nome] = uf.toUpperCase();
  localStorage.setItem('mapaCidades', JSON.stringify(mapaExtra));
}