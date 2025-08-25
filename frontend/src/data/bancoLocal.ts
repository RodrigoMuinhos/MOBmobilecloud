// src/data/bancoLocal.ts

import {
  Cliente,
  Produto,
  Usuario,
  Venda,
  VendaAtacado,
  ConfiguracaoSistema,
} from '../types/banco';

/* ---------------- BANCO CENTRAL ---------------- */
export const carregarBanco = (): any => {
  return JSON.parse(localStorage.getItem('mobSupplyData') || '{}');
};

export const salvarBanco = (banco: any): void => {
  localStorage.setItem('mobSupplyData', JSON.stringify(banco));
};

/* ---------------- AUTH ---------------- */
export const authStorage = {
  salvarUsuarioAtual: (usuario: Usuario) =>
    localStorage.setItem('USUARIO_ATUAL', JSON.stringify(usuario)),

  carregarUsuarioAtual: (): Usuario | null =>
    JSON.parse(localStorage.getItem('USUARIO_ATUAL') || 'null'),

  salvarLoginLembrado: (lembrar: boolean) =>
    localStorage.setItem('LOGIN_LEMBRADO', JSON.stringify(lembrar)),

  carregarLoginLembrado: (): boolean =>
    JSON.parse(localStorage.getItem('LOGIN_LEMBRADO') || 'false'),

  salvarTipoUsuario: (tipo: string) =>
    localStorage.setItem('tipoUsuario', tipo),

  carregarTipoUsuario: (): string | null =>
    localStorage.getItem('tipoUsuario'),
};

/* ---------------- USUÁRIOS ---------------- */
export const usuarioStorage = {
  salvarUsuariosSistema: (usuarios: Usuario[]) =>
    localStorage.setItem('USUARIOS_SISTEMA', JSON.stringify(usuarios)),

  carregarUsuariosSistema: (): Usuario[] =>
    JSON.parse(localStorage.getItem('USUARIOS_SISTEMA') || '[]'),

  salvarEquipeExtra: (equipe: Usuario[]) =>
    localStorage.setItem('EquipeExtra', JSON.stringify(equipe)),

  carregarEquipeExtra: (): Usuario[] =>
    JSON.parse(localStorage.getItem('EquipeExtra') || '[]'),
};

/* ---------------- CLIENTES ---------------- */
export const clienteStorage = {
  salvarClientes: (clientes: Cliente[]) =>
    localStorage.setItem('clientesMOB', JSON.stringify(clientes)),

  carregarClientes: (): Cliente[] =>
    JSON.parse(localStorage.getItem('clientesMOB') || '[]'),

  salvarClientesValidados: (clientes: Cliente[]) =>
    localStorage.setItem('clientesValidados', JSON.stringify(clientes)),

  carregarClientesValidados: (): Cliente[] =>
    JSON.parse(localStorage.getItem('clientesValidados') || '[]'),

  salvarStatusClientes: (status: Record<string, string>) =>
    localStorage.setItem('statusClientes', JSON.stringify(status)),

  carregarStatusClientes: (): Record<string, string> =>
    JSON.parse(localStorage.getItem('statusClientes') || '{}'),

  salvarStatusClientesPF: (status: Record<string, string>) =>
    localStorage.setItem('statusClientesPF', JSON.stringify(status)),

  carregarStatusClientesPF: (): Record<string, string> =>
    JSON.parse(localStorage.getItem('statusClientesPF') || '{}'),
};

/* ---------------- ESTOQUE ---------------- */
export const estoqueStorage = {
  salvarEstoque: (estoque: Produto[]) =>
    localStorage.setItem('estoque_local', JSON.stringify(estoque)),

  carregarEstoque: (): Produto[] =>
    JSON.parse(localStorage.getItem('estoque_local') || '[]'),

  salvarLotesDistribuidor: (dados: Record<string, Produto[]>) =>
    localStorage.setItem('lotesDistribuidor', JSON.stringify(dados)),

  carregarLotesDistribuidor: (): Record<string, Produto[]> =>
    JSON.parse(localStorage.getItem('lotesDistribuidor') || '{}'),
};

/* ---------------- VENDAS ---------------- */
export const vendaStorage = {
  salvarHistorico: (vendas: Venda[]) =>
    localStorage.setItem('vendasMOB', JSON.stringify(vendas)),

  carregarHistorico: (): Venda[] =>
    JSON.parse(localStorage.getItem('vendasMOB') || '[]'),

  salvarContador: (contador: number) =>
    localStorage.setItem('contadorVendas', contador.toString()),

  carregarContador: (): number =>
    parseInt(localStorage.getItem('contadorVendas') || '0'),

  salvarVendaDistribuidor: (id: string, venda: VendaAtacado) =>
    localStorage.setItem(`VENDA_${id}`, JSON.stringify(venda)),

  carregarVendaDistribuidor: (id: string): VendaAtacado | null =>
    JSON.parse(localStorage.getItem(`VENDA_${id}`) || 'null'),
};

/* ---------------- CONFIGURAÇÕES E TEMA ---------------- */
export const configStorage = {
  salvarTemaAtual: (tema: string) =>
    localStorage.setItem('TEMA_ATUAL', tema),

  carregarTemaAtual: (): string =>
    localStorage.getItem('TEMA_ATUAL') || 'classic',

  salvarConfigSistema: (config: ConfiguracaoSistema) =>
    localStorage.setItem('CONFIG_MOB', JSON.stringify(config)),

  carregarConfigSistema: (): ConfiguracaoSistema =>
    JSON.parse(localStorage.getItem('CONFIG_MOB') || '{}'),
};
