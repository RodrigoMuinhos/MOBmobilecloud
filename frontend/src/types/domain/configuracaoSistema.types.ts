export type ConfiguracaoSistema = {
  nomeEmpresa: string;
  idiomaPadrao: 'pt' | 'en';
  modoSincronizacao: 'manual' | 'automatica';
  exibirEstoqueBaixo: boolean;
};
