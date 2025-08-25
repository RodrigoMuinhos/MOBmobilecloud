export interface DadosFinanceiros {
  subtotal: number;
  descontoPercentual?: number;
  descontoValor?: number;
  destinoDesconto?: string;
  frete?: number;
  acrescimo?: number;
  formaPagamento?: string;
  parcelas?: number;
  totalFinal: number;
}
