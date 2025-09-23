import { api } from '@/services/api';

export type FilialMin = { id: string; nome: string; uf?: string };
export type TipoVaria = { key: 'caixa'|'5un'|'unidade'; label: string; preco: number };
export type ProdutoCatalogo = {
  id: string;
  nome: string;
  marca?: string | null;
  codigo?: string | null;
  tipos: TipoVaria[];
};

function handle401(e: any) {
  if (e?.response?.status === 401 && typeof window !== 'undefined') {
    window.location.href = '/login';
  }
}

export async function listarFiliais(): Promise<FilialMin[]> {
  try {
    const { data } = await api.get('/filiais');
    const arr = Array.isArray(data) ? data : (data?.items ?? []);
    return arr.map((f: any) => ({ id: f.id, nome: f.nome, uf: f.uf }));
  } catch (e) { handle401(e); throw e; }
}

export async function listarProdutosPorFilial(
  filialId: string,
): Promise<ProdutoCatalogo[]> {
  try {
    const { data } = await api.get('/produtoestoque', { params: { filialId } });
    const arr = Array.isArray(data) ? data : (data?.items ?? []);

    const buildTipos = (r: any): TipoVaria[] => {
      // preços crus (podem vir como string)
      const pCaixa = Number(r.preco_venda_caixa ?? r.preco_caixa ?? r.precoBox ?? NaN);
      const pUnit  = Number(r.preco_venda_unidade ?? r.preco ?? r.precoUnitario ?? NaN);
      const p5un   = Number(r.preco_5un ?? r.preco5un ?? NaN);
      const upc    = Number(r.unidades_por_caixa ?? r.unidadesPorCaixa ?? NaN);

      // derivações úteis
      const unitByCaixa = !Number.isNaN(pCaixa) && !Number.isNaN(upc) && upc > 0 ? pCaixa / upc : NaN;
      const fiveByUnit  = !Number.isNaN(pUnit)  ? pUnit * 5 : (!Number.isNaN(unitByCaixa) ? unitByCaixa * 5 : NaN);

      // SEMPRE 3 opções. Se faltar preço, mostramos 0.
      return [
        { key: 'caixa',   label: 'Box',     preco: !Number.isNaN(pCaixa) ? pCaixa : 0 },
        { key: '5un',     label: '5 Units', preco: !Number.isNaN(p5un)   ? p5un   : (!Number.isNaN(fiveByUnit) ? fiveByUnit : 0) },
        { key: 'unidade', label: 'Unit',    preco: !Number.isNaN(pUnit)  ? pUnit  : (!Number.isNaN(unitByCaixa) ? unitByCaixa : 0) },
      ];
    };

    return arr.map((r: any) => ({
      id: r.id,
      nome: r.nome ?? '',
      marca: r.marca ?? null,
      codigo: r.codigo ?? r.sku ?? null,
      tipos: buildTipos(r),
    }));
  } catch (e) { handle401(e); throw e; }
}
