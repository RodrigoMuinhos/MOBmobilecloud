import { Cliente } from '../../types/domain/cliente.types';

export function gerarObservacoesVenda(cliente: Cliente, observacoesExtras?: string): string {
  const partes: string[] = [];

  partes.push(`Venda para: ${cliente.nome}`);
  if (cliente.cidade || cliente.estado) {
    partes.push(`Local: ${cliente.cidade || ''}/${cliente.estado || ''}`);
  }
  if (cliente.whatsapp) {
    partes.push(`Contato: ${cliente.whatsapp}`);
  }
  if (observacoesExtras) {
    partes.push(`Obs: ${observacoesExtras}`);
  }

  return partes.join(' | ');
}
