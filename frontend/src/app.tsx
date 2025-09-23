import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import AppRoutes from './routes/AppRoutes';
import LoginPage from './features/login/pages/LoginPage';
import PreLoginScreen from './features/login/components/PreLoginScreen';

const ConteudoPrincipal = () => {
  const { loginAtivo } = useAuth();
  const [mostrarPreLogin, setMostrarPreLogin] = useState(false);
  const [jaVerificou, setJaVerificou] = useState(false);

  useEffect(() => {
    const lembrar = localStorage.getItem('LOGIN_LEMBRADO');
    const usuario = localStorage.getItem('USUARIO_ATUAL');

    console.log('Verificando login automático →', {
      lembrar,
      usuario,
      loginAtivo,
    });

    if (!loginAtivo && lembrar && usuario) {
      setMostrarPreLogin(true);
    }

    setJaVerificou(true);
  }, [loginAtivo]);

  if (!jaVerificou) return null;

  if (loginAtivo) return <AppRoutes />;

  if (mostrarPreLogin) {
    return (
      <PreLoginScreen
        onContinuar={() => setMostrarPreLogin(false)}
      />
    );
  }

  return <LoginPage />;
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ConteudoPrincipal />
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;