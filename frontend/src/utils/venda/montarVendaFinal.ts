import { Cliente } from '../../types/domain/cliente.types';
import { CartItem } from '../../types/domain/carrinho';
import { mapCartItemsToProdutos } from '../../mappers/cartItemToProduto';

interface DadosFinanceiros {
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

export function montarVendaFinal(
  cliente: Cliente,
  carrinho: CartItem[],
  dados: DadosFinanceiros
) {
  const produtos = mapCartItemsToProdutos(carrinho); // transforma para array com { id, nome, preco, quantidade, ... }

  return {
     clienteId: cliente.id,            
    clienteNome: cliente.nome,  
    cliente: {
      id: cliente.id,
      nome: cliente.nome,
    },
    carrinho: produtos,
    subtotal: dados.subtotal,
    descontoPercentual: dados.descontoPercentual || 0,
    descontoValor: dados.descontoValor || 0,
    destinoDesconto: dados.destinoDesconto || null,
    frete: dados.frete || 0,
    acrescimo: dados.acrescimo || 0,
    formaPagamento: dados.formaPagamento || 'Pix',
    parcelas: dados.parcelas || 1,
    totalFinal: dados.totalFinal,
  };
}
