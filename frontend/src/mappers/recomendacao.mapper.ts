import { RecomendacaoAPI } from '../api/recomendacaoApi.types';
import { Recomendacao } from '../domain/recomendacao.types';
import { mapProdutoApiToDomain, mapProdutoDomainToApi } from './produto.mapper';

/**
 * Converte uma recomendação da API para o formato usado no frontend.
 */
export function mapRecomendacaoApiToDomain(api: RecomendacaoAPI): Recomendacao {
  return {
    id: api.id ?? '',
    clienteId: api.clienteId ?? '',
    texto: api.texto ?? '',
    data: api.data ?? '',
    produtosRelacionados: api.produtosRelacionados?.map(mapProdutoApiToDomain) ?? [],
  };
}


/**
 * Converte uma recomendação do frontend para o formato usado na API.
 */
export function mapRecomendacaoDomainToApi(domain: Recomendacao): RecomendacaoAPI {
  return {
    id: domain.id,
    clienteId: domain.clienteId,
    texto: domain.texto,
    data: domain.data,
    produtosRelacionados: domain.produtosRelacionados.map(mapProdutoDomainToApi),
  };
}
