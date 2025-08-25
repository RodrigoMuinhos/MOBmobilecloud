// src/context/LanguageContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { textos } from '../i18n/textos';
type Language = typeof textos['en'];

interface LanguageContextProps {
  language: Language;
  currentLang: 'en' | 'pt';
  toggleLanguage: () => void;
  textos: typeof textos; 
}

const LanguageContext = createContext<LanguageContextProps>({} as LanguageContextProps);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLang] = useState<'en' | 'pt'>(
    () => (localStorage.getItem('currentLang') as 'en' | 'pt') || 'en'
  );

  const toggleLanguage = () => {
    const newLang = currentLang === 'en' ? 'pt' : 'en';
    setCurrentLang(newLang);
    localStorage.setItem('currentLang', newLang);
  };

  return (
    <LanguageContext.Provider value={{
      language: textos[currentLang],
      currentLang,
      toggleLanguage,
      textos, 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
