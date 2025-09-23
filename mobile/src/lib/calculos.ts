export const arred = (v: number) => Number(((v ?? 0) as number).toFixed(2));
export function calcSubtotal(itens: { quantidade: number; precoUnitario: number }[]) {
  return arred(itens.reduce((acc, i) => acc + (i.quantidade || 0) * (i.precoUnitario || 0), 0));
}
export function calcTotalFinal(subtotal: number, descontoValor: number, frete: number) {
  return arred(Math.max(0, subtotal - (descontoValor || 0)) + (frete || 0));
}
export function hidratarCarrinho<T extends { quantidade: number; precoUnitario: number }>(itens: T[]) {
  return itens.map((i) => ({ ...i, subtotal: arred((i.quantidade || 0) * (i.precoUnitario || 0)) }));
}
