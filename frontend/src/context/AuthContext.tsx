import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react';

// ✅ Agora exportado
export type TipoUsuario = 'adm' | 'filiado' | 'vendedor';

interface AuthContextType {
  tipoUsuario: TipoUsuario | null;
  loginAtivo: boolean;
  login: (tipo: TipoUsuario) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tipoUsuario, setTipoUsuario] = useState<TipoUsuario | null>(null);
  const [loginAtivo, setLoginAtivo] = useState(false);

  // ✅ Carrega tipo salvo com validação
  useEffect(() => {
    const tipoSalvo = localStorage.getItem('tipoUsuario');
    if (tipoSalvo === 'adm' || tipoSalvo === 'filiado' || tipoSalvo === 'vendedor') {
      setTipoUsuario(tipoSalvo);
      setLoginAtivo(true);
    }
  }, []);

  const login = (tipo: TipoUsuario) => {
    localStorage.setItem('tipoUsuario', tipo);
    setTipoUsuario(tipo);
    setLoginAtivo(true);
  };

  const logout = () => {
    localStorage.removeItem('tipoUsuario');
    setTipoUsuario(null);
    setLoginAtivo(false);
  };

  return (
    <AuthContext.Provider value={{ tipoUsuario, loginAtivo, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth precisa estar dentro de AuthProvider');
  return context;
};