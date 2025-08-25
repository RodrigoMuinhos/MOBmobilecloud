// /types/api/configuracaoApi.types.ts

export interface ConfiguracaoSistemaAPI {
  id?: string;
  nomeEmpresa: string;
  idiomaPadrao: 'pt' | 'en';
  modoSincronizacao: 'manual' | 'automatica';
  exibirEstoqueBaixo: boolean;
  criadoEm?: string;
  atualizadoEm?: string;
}
