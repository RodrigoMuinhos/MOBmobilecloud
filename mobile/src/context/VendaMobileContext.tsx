'use client';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ItemCarrinho = {
  id: string;
  nome: string;
  tipoSelecionado?: string;
  quantidade: number;
  precoUnitario: number;
};

type Ctx = {
  carrinho: ItemCarrinho[];
  addItem: (i: ItemCarrinho) => void;
  inc: (id: string) => void;
  dec: (id: string) => void;
  rmItem: (id: string) => void;
  subtotal: number;

  /** NOVO: filial selecionada na venda */
  filialId: string | null;
  setFilialId: (id: string) => void;
};

const Ctx = createContext<Ctx | undefined>(undefined);

export function VendaMobileProvider({ children }: { children: React.ReactNode }) {
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [filialId, _setFilialId] = useState<string | null>(null);

  // carregar do storage
  useEffect(() => {
    try {
      const c = sessionStorage.getItem('ms_cart');
      if (c) setCarrinho(JSON.parse(c));
      const f = localStorage.getItem('filialId');
      if (f) _setFilialId(f);
    } catch {}
  }, []);

  // persistir carrinho
  useEffect(() => {
    try {
      sessionStorage.setItem('ms_cart', JSON.stringify(carrinho));
    } catch {}
  }, [carrinho]);

  // setter com persistência
  const setFilialId = (id: string) => {
    _setFilialId(id);
    try { localStorage.setItem('filialId', id); } catch {}
  };

  const addItem = (i: ItemCarrinho) => {
    setCarrinho((old) => {
      const idx = old.findIndex(
        (x) => x.id === i.id && x.tipoSelecionado === i.tipoSelecionado
      );
      if (idx >= 0) {
        const copy = [...old];
        copy[idx] = { ...copy[idx], quantidade: copy[idx].quantidade + i.quantidade };
        return copy;
      }
      return [...old, i];
    });
  };

  const inc = (id: string) =>
    setCarrinho((old) =>
      old.map((x) => (x.id === id ? { ...x, quantidade: x.quantidade + 1 } : x))
    );

  const dec = (id: string) =>
    setCarrinho((old) =>
      old
        .map((x) => (x.id === id ? { ...x, quantidade: x.quantidade - 1 } : x))
        .filter((x) => x.quantidade > 0)
    );

  const rmItem = (id: string) => setCarrinho((old) => old.filter((x) => x.id !== id));

  const subtotal = useMemo(
    () => carrinho.reduce((s, it) => s + it.precoUnitario * it.quantidade, 0),
    [carrinho]
  );

  const value: Ctx = {
    carrinho,
    addItem,
    inc,
    dec,
    rmItem,
    subtotal,
    filialId,
    setFilialId, // <<--- agora existe
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useVendaMobile() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useVendaMobile must be used within VendaMobileProvider');
  return ctx;
}
