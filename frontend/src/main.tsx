import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext'; 
import { CarrinhoProvider } from './context/CarrinhoContext';
import { HashRouter, BrowserRouter } from 'react-router-dom';


const isElectron = navigator.userAgent.toLowerCase().includes('electron');
const Router = isElectron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
<React.StrictMode>
  <Router>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <CarrinhoProvider>
            <App />
          </CarrinhoProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </Router>
</React.StrictMode>

);
