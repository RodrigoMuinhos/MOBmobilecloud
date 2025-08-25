// src/utils/estoqueUtils.ts
export type EstoqueBanco<T = any> = Record<string, Record<string, T[]>>;

export function organizarEstoquePorGrupo<T extends {
  marca?: string | null | undefined;
  tipo?: string  | null | undefined;
}>(estoque: T[]): EstoqueBanco<T> {
  const agrupado: EstoqueBanco<T> = {};

  estoque.forEach((item) => {
    const marca = (item.marca ?? 'Sem Marca') || 'Sem Marca';
    const tipo  = (item.tipo  ?? 'Padrão')    || 'Padrão';

    if (!agrupado[marca]) agrupado[marca] = {};
    if (!agrupado[marca][tipo]) agrupado[marca][tipo] = [];

    agrupado[marca][tipo].push(item);
  });

  return agrupado;
}
