// src/mocks/estoqueMock.ts
export type FilialAPI = { id: string; nome: string; cidade: string; estado: string; ativa: boolean };
export type TotaisEstoqueAPI = { valorTotal: number; totalUnidades: number; qtdMarcas: number; qtdModelos: number };
export type ProdutoEstoqueAPI = {
  id: string; codigo: string; nome: string;
  marca?: string | null; modelo?: string | null;
  preco_venda_unidade: number; quantidade: number; filialId: string;
};

let filiais: FilialAPI[] = [
  { id: '1', nome: 'Matriz Belém', cidade: 'Belém', estado: 'PA', ativa: true },
  { id: '2', nome: 'Loja Fortaleza', cidade: 'Fortaleza', estado: 'CE', ativa: true },
];

let itens: ProdutoEstoqueAPI[] = [
  { id: 'p1', codigo: 'ABC-001', nome: 'Produto A', marca: 'Marca X', modelo: 'M1', preco_venda_unidade: 49.9, quantidade: 10, filialId: '1' },
  { id: 'p2', codigo: 'ABC-002', nome: 'Produto B', marca: 'Marca Y', modelo: 'M2', preco_venda_unidade: 89.9, quantidade: 4, filialId: '1' },
  { id: 'p3', codigo: 'ABC-101', nome: 'Produto C', marca: 'Marca X', modelo: 'M1', preco_venda_unidade: 19.9, quantidade: 25, filialId: '2' },
];

const sleep = (ms=300)=>new Promise(r=>setTimeout(r,ms));

export async function listarFiliaisMock(): Promise<FilialAPI[]> { await sleep(); return filiais; }

export async function criarFilialMock(payload: {nome:string;cidade:string;estado:string}): Promise<FilialAPI> {
  await sleep();
  const nova = { id: String(Date.now()), nome: payload.nome, cidade: payload.cidade, estado: payload.estado, ativa: true };
  filiais = [...filiais, nova];
  return nova;
}

export async function getTotaisEstoqueMock(filialId: string): Promise<TotaisEstoqueAPI> {
  await sleep();
  const rows = itens.filter(i => i.filialId === filialId);
  const valorTotal = rows.reduce((s, r) => s + r.preco_venda_unidade * r.quantidade, 0);
  const totalUnidades = rows.reduce((s, r) => s + r.quantidade, 0);
  const marcas = new Set(rows.map(r => r.marca).filter(Boolean));
  const modelos = new Set(rows.map(r => r.modelo).filter(Boolean));
  return { valorTotal, totalUnidades, qtdMarcas: marcas.size, qtdModelos: modelos.size };
}

export async function listarEstoqueMock(filialId: string): Promise<ProdutoEstoqueAPI[]> {
  await sleep();
  return itens.filter(i => i.filialId === filialId);
}
