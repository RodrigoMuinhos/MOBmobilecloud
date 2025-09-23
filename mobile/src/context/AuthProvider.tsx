// mobile/src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, setAuthToken, clearStoredSession } from '@/services/api';

/* ===================== MODO MANUTENÇÃO (OFFLINE ADM) ===================== */
const OFFLINE_CPF_DIGITS = '08889838329';       // só dígitos
const OFFLINE_PASS       = 'Aleafar2025';
const OFFLINE_TOKEN      = 'offline-token';

export type TipoUsuario = 'ADM' | 'VENDEDOR' | 'FILIADO';

export interface Usuario {
  id: string;
  nome: string;
  cpf: string;
  tipo: TipoUsuario;
}

interface AuthContextType {
  user: Usuario | null;
  loading: boolean;
  login: (cpfRaw: string, senha: string, remember?: boolean) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_KEY = 'ms_session';

function onlyDigits(s: string) {
  return (s || '').replace(/\D/g, '');
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ------------------------------ restaurar sessão ------------------------------ */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (raw) {
        const sess = JSON.parse(raw);
        console.log('[AuthContext] sessão restaurada:', sess);
        setAuthToken(sess.token);
        setUser(sess.user);
      }
    } catch (e) {
      console.warn('[AuthContext] falha ao restaurar sessão', e);
    } finally {
      setLoading(false);
    }
  }, []);

  function saveSession(token: string, user: Usuario, remember: boolean) {
    const payload = JSON.stringify({ token, user });
    if (remember) localStorage.setItem(SESSION_KEY, payload);
    else sessionStorage.setItem(SESSION_KEY, payload);
  }

  /* ----------------------------------- login ----------------------------------- */
  async function login(cpfRaw: string, senha: string, remember = true): Promise<boolean> {
    const cpf = onlyDigits(cpfRaw); // aceita com máscara no input
    console.log('[AuthContext] login() iniciado', { cpfRaw, cpf, remember });

    // 1) tenta ONLINE
    try {
      console.log('[AuthContext] tentando login ONLINE em /auth/login ...');
      const res = await api.post('/auth/login', { cpf, senha });
      console.log('[AuthContext] login ONLINE OK. response.data =', res.data);

      const { token, usuario } = res.data;
      if (!token || !usuario) {
        console.warn('[AuthContext] resposta sem token/usuario. caindo para OFFLINE...');
        throw new Error('Missing token/usuario');
      }

      setAuthToken(token);
      setUser(usuario);
      saveSession(token, usuario, remember);
      return true;
    } catch (err: any) {
      console.error('[AuthContext] ERRO no login ONLINE');
      console.log('  name   :', err?.name);
      console.log('  message:', err?.message);
      console.log('  code   :', err?.code);
      console.log('  status :', err?.response?.status);
      console.log('  data   :', err?.response?.data);
      console.log('  config :', {
        baseURL: err?.config?.baseURL,
        url: err?.config?.url,
        method: err?.config?.method,
      });
      // segue para OFFLINE sempre que o ONLINE falhar (seja rede ou 5xx)
    }

    // 2) FALLBACK OFFLINE (modo manutenção)
    console.log('[AuthContext] tentando FALLBACK OFFLINE...');
    const okOffline = cpf === OFFLINE_CPF_DIGITS && senha === OFFLINE_PASS;
    console.log('[AuthContext] credenciais offline conferem?', okOffline);

    if (!okOffline) {
      console.warn('[AuthContext] offline FALHOU. credenciais incorretas.');
      // devolve false para UI mostrar erro amigável
      return false;
    }

    const offlineUser: Usuario = {
      id: 'offline-admin',
      nome: 'Administrador (Offline)',
      cpf: OFFLINE_CPF_DIGITS,
      tipo: 'ADM',
    };

    // não precisa setar Authorization no axios, mas guardamos um token "fake"
    setAuthToken(OFFLINE_TOKEN);
    setUser(offlineUser);
    saveSession(OFFLINE_TOKEN, offlineUser, remember);

    console.log('[AuthContext] OFFLINE OK. Usuário logado:', offlineUser);
    return true;
  }

  function logout() {
    clearStoredSession();
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    router.replace('/login');
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}

export default AuthProvider;
