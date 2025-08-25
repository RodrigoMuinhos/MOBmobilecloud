// src/context/IdiomaContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { textos } from '../i18n/textos';

type Idioma = typeof textos['pt']; // 🔥 INFERE o tipo com base no objeto real

interface IdiomaContextProps {
  idioma: Idioma;
  idiomaAtual: 'pt' | 'en';
  alternarIdioma: () => void;
}

const IdiomaContext = createContext<IdiomaContextProps>({} as IdiomaContextProps);

export const IdiomaProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idiomaAtual, setIdiomaAtual] = useState<'pt' | 'en'>(() => {
    const salvo = localStorage.getItem('idiomaAtual');
    return (salvo === 'en' || salvo === 'pt') ? salvo : 'pt';
  });

  const alternarIdioma = () => {
    const novo = idiomaAtual === 'pt' ? 'en' : 'pt';
    setIdiomaAtual(novo);
    localStorage.setItem('idiomaAtual', novo);
  };

  const idioma = textos[idiomaAtual];

  return (
    <IdiomaContext.Provider value={{ idioma, idiomaAtual, alternarIdioma }}>
      {children}
    </IdiomaContext.Provider>
  );
};

export const useIdioma = () => useContext(IdiomaContext);
