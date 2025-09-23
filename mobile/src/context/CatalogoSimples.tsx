'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '@/services/api';

type Filial = { id: string; nome?: string | null; cidade?: string | null; uf?: string | null };
type ProdutoAPI = {
  id: string;
  nome: string;
  codigo?: string | null;
  marca?: string | null;
  tipo?: string | null;
  unidades_por_caixa?: number | null;
  preco_venda_unidade?: number | null;
  preco_venda_caixa?: number | null;
  estoqueId?: string | null;
  filialId?: string | null;
};

type CatalogoCtx = {
  filiais: Filial[];
  produtos: ProdutoAPI[];
  marcas: string[];
  loading: boolean;
  reload: () => Promise<void>;
};

const CatalogoContext = createContext<CatalogoCtx>({
  filiais: [],
  produtos: [],
  marcas: [],
  loading: true,
  reload: async () => {},
});

export function CatalogoProvider({ children }: { children: React.ReactNode }) {
  const [filiais, setFiliais] = useState<Filial[]>([]);
  const [produtos, setProdutos] = useState<ProdutoAPI[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    try {
      // tenta API real
      const [f, p] = await Promise.all([
        api.get<Filial[]>('/filiais'),
        api.get<ProdutoAPI[]>('/produtoestoque'), // pode filtrar por filial depois
      ]);
      setFiliais(f.data || []);
      setProdutos((p.data || []).map((x) => ({ ...x, marca: x.marca ?? 'Sem marca' })));
    } catch {
      // fallback local: mínimo viável pra testar carrinho
      const fakeFilial: Filial = { id: 'offline-filial', nome: 'Offline', cidade: 'Recife', uf: 'PE' };
      const fakeProds: ProdutoAPI[] = [
        { id: 'p1', nome: 'Shampoo VX 300ml', marca: 'VX', tipo: 'RL', unidades_por_caixa: 12, preco_venda_caixa: 239.88, preco_venda_unidade: 19.99, filialId: fakeFilial.id },
        { id: 'p2', nome: 'Condicionador VX 300ml', marca: 'VX', tipo: 'RL', unidades_por_caixa: 12, preco_venda_caixa: 251.88, preco_venda_unidade: 20.99, filialId: fakeFilial.id },
        { id: 'p3', nome: 'Óleo SKN 60ml', marca: 'SKN', tipo: 'PR', unidades_por_caixa: 24, preco_venda_caixa: 599.76, preco_venda_unidade: 24.99, filialId: fakeFilial.id },
      ];
      setFiliais([fakeFilial]);
      setProdutos(fakeProds);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { carregar(); }, []);

  const marcas = useMemo(
    () => Array.from(new Set(produtos.map((p) => (p.marca ?? '').trim()).filter(Boolean))).sort(),
    [produtos]
  );

  return (
    <CatalogoContext.Provider value={{ filiais, produtos, marcas, loading, reload: carregar }}>
      {children}
    </CatalogoContext.Provider>
  );
}

export const useCatalogo = () => useContext(CatalogoContext);
