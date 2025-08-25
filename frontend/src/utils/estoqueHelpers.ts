import { EstoqueBanco, ItemEstoque } from '../types/banco';
import { carregarBanco, salvarBanco } from '../data/bancoLocal';

/**
 * Calcula o total pago por uma marca específica
 */
export const calcularTotalPorMarca = (estoque: EstoqueBanco, marca: string): number => {
  return Object.values(estoque).reduce((totalCategoria, tipos) => {
    const subtotal = Object.values(tipos).flat().reduce((acc, item) => {
      if (item.marca?.toLowerCase() === marca.toLowerCase()) {
        return acc + (item.valorPago ?? 0);
      }
      return acc;
    }, 0);
    return totalCategoria + subtotal;
  }, 0);
};

/**
 * Calcula o total geral pago e total estimado de venda
 */
export const calcularTotaisGerais = (estoque: EstoqueBanco) => {
  const totalPago = Object.values(estoque).flatMap((tipos) =>
    Object.values(tipos).flatMap((itens) =>
      itens.map((item) => item.valorPago ?? 0)
    )
  ).reduce((acc, val) => acc + val, 0);

  const totalVenda = Object.values(estoque).flatMap((tipos) =>
    Object.values(tipos).flatMap((itens) =>
      itens.map((item) => item.preco_unit * item.quantidade_em_estoque)
    )
  ).reduce((acc, val) => acc + val, 0);

  return { totalPago, totalVenda };
};

/**
 * Renomeia uma marca no estoque
 */
export const renomearMarca = (estoque: EstoqueBanco, antiga: string, nova: string): EstoqueBanco => {
  if (!nova || nova === antiga || estoque[nova]) return estoque;
  const copia = { ...estoque };
  copia[nova] = copia[antiga];
  delete copia[antiga];
  const banco = carregarBanco();
  const atualizado = { ...banco, estoque: copia };
  salvarBanco(atualizado);
  return copia;
};

/**
 * Renomeia um tipo (modelo) dentro de uma marca
 */
export const renomearTipo = (estoque: EstoqueBanco, marca: string, tipoAntigo: string, tipoNovo: string): EstoqueBanco => {
  if (!tipoNovo || tipoAntigo === tipoNovo || estoque[marca]?.[tipoNovo]) return estoque;
  const copia = { ...estoque };
  copia[marca][tipoNovo] = copia[marca][tipoAntigo];
  delete copia[marca][tipoAntigo];
  const banco = carregarBanco();
  const atualizado = { ...banco, estoque: copia };
  salvarBanco(atualizado);
  return copia;
};
