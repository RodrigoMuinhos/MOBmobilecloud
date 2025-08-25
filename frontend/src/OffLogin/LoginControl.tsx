import React, { createContext, useContext, useState } from 'react';

interface LoginControlContextType {
  loginAtivo: boolean;
  toggleLogin: () => void;
}

const LoginControlContext = createContext<LoginControlContextType | undefined>(undefined);

export const LoginControlProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loginAtivo, setLoginAtivo] = useState(true);

  const toggleLogin = () => {
    setLoginAtivo((prev) => !prev);
  };

  return (
    <LoginControlContext.Provider value={{ loginAtivo, toggleLogin }}>
      {children}
    </LoginControlContext.Provider>
  );
};

export const useLoginControl = () => {
  const context = useContext(LoginControlContext);
  if (!context) throw new Error('useLoginControl precisa estar dentro de LoginControlProvider');
  return context;
};