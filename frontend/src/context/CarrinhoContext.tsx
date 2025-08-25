// src/context/CarrinhoContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { CartItem } from '../types/domain/carrinho';

export interface CarrinhoContextType {
  carrinho: CartItem[];
  adicionarAoCarrinho: (item: CartItem) => void;
  removerDoCarrinho: (index: number) => void;
  limparCarrinho: () => void;
  setCarrinho: Dispatch<SetStateAction<CartItem[]>>;
}

const CarrinhoContext = createContext<CarrinhoContextType | undefined>(undefined);

export const CarrinhoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [carrinho, setCarrinho] = useState<CartItem[]>([]);

  const adicionarAoCarrinho = (item: CartItem) => {
    setCarrinho((prev) => {
      const index = prev.findIndex(
        (p) =>
          p.codigo === item.codigo &&
          p.tipo === item.tipo &&
          p.marca === item.marca
      );

      if (index !== -1) {
        const atualizado = [...prev];
        const existente = atualizado[index];
        const novaQtd = existente.quantidade + item.quantidade;

        atualizado[index] = {
          ...existente,
          quantidade: novaQtd,
          subtotal: parseFloat((existente.precoUnitario * novaQtd).toFixed(2)),
        };

        return atualizado;
      } else {
        return [...prev, item];
      }
    });
  };

  const removerDoCarrinho = (index: number) => {
    setCarrinho((prev) => prev.filter((_, i) => i !== index));
  };

  const limparCarrinho = () => setCarrinho([]);

  return (
    <CarrinhoContext.Provider
      value={{ carrinho, adicionarAoCarrinho, removerDoCarrinho, limparCarrinho, setCarrinho }}
    >
      {children}
    </CarrinhoContext.Provider>
  );
};

export const useCarrinho = (): CarrinhoContextType => {
  const context = useContext(CarrinhoContext);
  if (!context) throw new Error('useCarrinho must be used within a CarrinhoProvider');
  return context;
};
