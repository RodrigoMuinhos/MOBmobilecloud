// src/utils/clienteUtils.ts
import { Cliente, Venda } from '../types/banco';

export function getClientesComTotais(clientes: Cliente[], vendas: Venda[]) {
  return clientes.map((cliente) => {
    const cpfLimpo = cliente.cpf.replace(/\D/g, '');
    const vendasDoCliente = vendas.filter(
      (v) => v.cliente && v.cliente.cpf.replace(/\D/g, '') === cpfLimpo
    );

    const totalGasto = vendasDoCliente.reduce((soma, venda) => soma + (venda.total || 0), 0);
    const numeroCompras = vendasDoCliente.length;

    const ultimaCompra = vendasDoCliente
      .map((v) => new Date(v.data))
      .sort((a, b) => b.getTime() - a.getTime())[0]?.toISOString() || '';

    return {
      ...cliente,
      totalGasto,
      numeroCompras,
      ultimaCompra,
    };
  });
}
