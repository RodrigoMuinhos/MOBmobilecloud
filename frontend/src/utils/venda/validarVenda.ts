import { Venda } from '../../types/domain/venda.types';

export function validarVenda(venda: Venda): boolean {
  return (
    !!venda.clienteId &&
    !!venda.clienteNome &&
    Array.isArray(venda.produtos) &&
    venda.produtos.length > 0 &&
    typeof venda.totalFinal === 'number' &&
    venda.totalFinal > 0
  );
}
