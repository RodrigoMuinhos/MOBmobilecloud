import { Cliente } from '../types/ClienteValidados';

export function sincronizarClientesValidadosComBiblioteca(): Cliente[] {
  const bibliotecaRaw = localStorage.getItem('bibliotecaDados');
  const existentesRaw = localStorage.getItem('clientesValidados');

  const biblioteca: any[] = bibliotecaRaw ? JSON.parse(bibliotecaRaw) : [];
  const existentes: Cliente[] = existentesRaw ? JSON.parse(existentesRaw) : [];

  const atualizados: Cliente[] = biblioteca.map((item: any) => {
    const cnpj = item.cnpj || item.CNPJ || null;
    const clienteExistente = existentes.find((cli) => cli.cnpj?.toString() === cnpj?.toString());

    return {
      cnpj,
      uf: item.uf || item.UF || clienteExistente?.uf || null,
      distrito: item.distrito || item.cidade || item.Cidade || clienteExistente?.distrito || null,
      nomeFantasia:
        item.nomeFantasia ||
        item.nome_fantasia ||
        item.nome ||
        clienteExistente?.nomeFantasia ||
        clienteExistente?.nome_fantasia ||
        null,
      telefone: clienteExistente?.telefone || [],
      validado: clienteExistente?.validado || null,
    };
  });

  localStorage.setItem('clientesValidados', JSON.stringify(atualizados));
  return atualizados;
}