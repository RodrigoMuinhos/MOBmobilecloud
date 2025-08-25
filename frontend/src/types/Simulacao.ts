export type Simulacao = {
  id: string;
  nome: string;
  studio: string;
  cpfCnpj: string;
  endereco: string;
  tipo: 'Consignado' | 'Pré-venda';
  data: string;

  // Dados financeiros e de simulação
  valorInvestido: number;       // valorCompra * quantidade
  valorCompra: number;          // valor unitário de compra (caixa 20un)
  quantidade: number;           // quantidade de caixas compradas

  valorVenda?: number;          // valor da venda em atacado (opcional)
  valorVendaVarejo?: number;    // valor da venda no varejo (opcional)
};