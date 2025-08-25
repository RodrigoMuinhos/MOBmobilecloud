import { Produto } from '../types/domain/produto.types';
import { ProdutoAPI } from '../types/api/produtoApi.types';

export function mapProdutoApiToDomain(api: ProdutoAPI): Produto {
  return {
    id: api.id ?? '',
    nome: api.nome ?? '',
    marca: api.marca ?? '',
    unidade: api.unidade ?? '',
    tipo: (api.tipo ?? 'unidade') as 'caixa' | '5un' | 'unidade',
    quantidade: api.quantidade ?? 0,
    preco: api.preco ?? 0,
    desconto: api.desconto ?? 0,
    precoOriginal: api.precoOriginal ?? api.preco ?? 0,
    precoCaixa: api.precoCaixa ?? 0,
    precoUnidade: api.precoUnidade ?? 0,
    preco5un: api.preco5un ?? 0,
    custo: api.custo ?? 0,
    personalizado: api.personalizado ?? false,
    codigo: api.codigo ?? '',
    precoUnitario: api.precoUnitario ?? 0,
    subtotal: api.subtotal ?? 0,
    categoria: '', 
    quantidade_em_estoque: 0,
  };
}

export function mapProdutoDomainToApi(domain: Produto): ProdutoAPI {
  return {
    id: domain.id,
    nome: domain.nome,
    marca: domain.marca,
    unidade: domain.unidade,
    tipo: domain.tipo,
    quantidade: domain.quantidade,
    preco: domain.preco,
    desconto: domain.desconto,
    precoOriginal: domain.precoOriginal,
    precoCaixa: domain.precoCaixa,
    precoUnidade: domain.precoUnidade,
    preco5un: domain.preco5un,
    custo: domain.custo,
    personalizado: domain.personalizado,
    codigo: domain.codigo,
    precoUnitario: domain.precoUnitario,
    subtotal: domain.subtotal,
  };
}
