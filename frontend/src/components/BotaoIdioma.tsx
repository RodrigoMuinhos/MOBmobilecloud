// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { textos } from '../i18n/textos';

type Idioma = typeof textos['pt'];

interface LanguageContextProps {
  language: Idioma;
  idiomaAtual: 'pt' | 'en';
  alternarIdioma: () => void;
}

const LanguageContext = createContext<LanguageContextProps>({} as LanguageContextProps);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [idiomaAtual, setIdiomaAtual] = useState<'pt' | 'en'>(() => {
    const salvo = localStorage.getItem('idiomaAtual');
    return salvo === 'en' ? 'en' : 'pt';
  });

  const alternarIdioma = () => {
    const novo = idiomaAtual === 'pt' ? 'en' : 'pt';
    setIdiomaAtual(novo);
    localStorage.setItem('idiomaAtual', novo);
  };

  const language = textos[idiomaAtual];

  return (
    <LanguageContext.Provider value={{ language, idiomaAtual, alternarIdioma }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage deve estar dentro de LanguageProvider');
  return context;
};
