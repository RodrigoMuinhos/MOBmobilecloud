export function calcularParcelas(total: number, parcelas: number): number {
  if (parcelas <= 1) return total;
  const valorParcela = total / parcelas;
  return parseFloat(valorParcela.toFixed(2));
}
