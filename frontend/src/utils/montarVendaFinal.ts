import { Produto, Venda, Cliente } from '../types/banco';

// 🧠 Função genérica para ler item do localStorage com tipagem segura
function getItemLocal<T>(chave: string, fallback: T): T {
  try {
    const item = localStorage.getItem(chave);
    return item ? (JSON.parse(item) as T) : fallback;
  } catch {
    return fallback;
  }
}

// 🧼 Remove pontuação e retorna apenas números do CPF
function formatarCPFParaNumero(cpf: string | undefined): number {
  if (!cpf) return 0;
  return parseInt(cpf.replace(/\D/g, '')) || 0;
}

export const montarVendaFinal = (): Venda | null => {
  try {
    const cliente: Cliente = getItemLocal<Cliente>('dados_cliente_venda', {} as Cliente);
    const carrinho: Produto[] = getItemLocal<Produto[]>('carrinho_venda', []);
    const financeiros = getItemLocal<any>('dados_financeiros_venda', {});

    if (!cliente || !cliente.nome || carrinho.length === 0 || !financeiros.totalFinal) return null;

    const data = new Date();
    const dataISO = data.toISOString();

    const novaVenda: Venda = {
      numero: Date.now(), // identificador numérico da venda
      cpf: formatarCPFParaNumero(cliente.cpf),
      id: `${cliente.cpf}-${dataISO}`,
      cliente,
      produtos: carrinho,

      subtotal: Number(financeiros.subtotal) || 0,
      total: Number(financeiros.totalFinal) || 0,
      totalFinal: Number(financeiros.totalFinal) || 0,

      desconto_aplicado: Number(financeiros.descontoPercentual > 0 ? 1 : 0),
      descontoPercentual: Number(financeiros.descontoPercentual) || 0,
      descontoValor: Number(financeiros.descontoValor) || 0,
      destinoDesconto: financeiros.destinoDesconto || '',

      frete: Number(financeiros.frete) || 0,
      acrescimo: Number(financeiros.acrescimo) || 0,

      forma_pagamento: financeiros.formaPagamento || '',
      formaPagamento: Number(financeiros.formaPagamento) || 0,
      parcelas: Number(financeiros.parcelas) || 1,

      status_pagamento: 'pendente',

      criadoEm: dataISO,
      atualizadoEm: dataISO,
      dataVenda: dataISO,

      vendedorId: '', // opcional, para login futuro
      observacoes: '', // campo livre para anotações
    };

    return novaVenda;
  } catch (erro) {
    console.error('Erro ao montar venda final:', erro);
    return null;
  }
};
