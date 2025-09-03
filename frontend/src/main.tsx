// src/main.tsx ou src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './app';
import './index.css';

import { LanguageProvider } from './context/LanguageContext';
import { CarrinhoProvider } from './context/CarrinhoContext';
import { HashRouter, BrowserRouter } from 'react-router-dom';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// 👇 registre o PWA (service worker)
import { registerSW } from 'virtual:pwa-register';
registerSW({ immediate: true }); // mantém o SW sempre atualizado

const isElectron = navigator.userAgent.toLowerCase().includes('electron');
const Router = isElectron ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
      <LanguageProvider>
        <CarrinhoProvider>
          <App />
          <ToastContainer position="top-right" autoClose={3000} newestOnTop />
        </CarrinhoProvider>
      </LanguageProvider>
    </Router>
  </React.StrictMode>
);
