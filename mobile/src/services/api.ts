// mobile/src/services/api.ts
import axios, { AxiosError, AxiosRequestConfig } from 'axios';

/**
 * Base URL strategy:
 * - Prefer env NEXT_PUBLIC_API_BASE_URL
 *   - Absoluta (http/https): usa como estiver (sem adicionar /api)
 *   - Relativa (/api, /_api): normaliza e usa relativa
 * - Fallback: '/api' (espera-se que o Next faça rewrite para o backend)
 */
function resolveBaseURL(): string {
  const raw = (process.env.NEXT_PUBLIC_API_BASE_URL || '').trim();

  if (raw) {
    // absoluta -> http(s)://...
    if (/^https?:\/\//i.test(raw)) {
      return raw.replace(/\/+$/, ''); // remove barra final
    }
    // relativa -> garante 1 barra no início e nenhuma no fim
    const cleaned = `/${raw.replace(/^\/+/, '').replace(/\/+$/, '')}`;
    return cleaned || '/api';
  }

  // padrão: same-origin via rewrite
  return '/api';
}

export const API_BASE = resolveBaseURL();

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 20_000,
  headers: {
    Accept: 'application/json',
  },
});

if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[next api] baseURL =', API_BASE);
}

/* =============================
   Sessão / Token helpers
============================= */
const TOKEN_KEYS = ['MS_AUTH_TOKEN', 'ms_token', 'TOKEN_MOB'] as const;
const USER_KEY = 'ms_user';

function readToken(): string | null {
  if (typeof window === 'undefined') return null;
  for (const k of TOKEN_KEYS) {
    const v = localStorage.getItem(k) || sessionStorage.getItem(k);
    if (v) return v;
  }
  return null;
}

export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function clearStoredSession() {
  if (typeof window === 'undefined') return;
  TOKEN_KEYS.forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(USER_KEY);
  setAuthToken(null);
}

/* =============================
   Interceptors
============================= */
// Request: injeta Bearer
api.interceptors.request.use((config) => {
  const token = readToken();
  if (token) {
    (config.headers as any).Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: logs em dev, trata erro de rede e 401
api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<any>) => {
    const status = error.response?.status;
    const cfg = (error.config ?? {}) as AxiosRequestConfig;

    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.warn('[next api] FAIL', {
        status,
        url: `${cfg.baseURL ?? ''}${cfg.url ?? ''}`,
        baseURL: cfg.baseURL,
        path: cfg.url,
        data: error.response?.data,
      });
    }

    // Erro de rede (backend fora/CORS/DNS/timeouts)
    if ((error as any).code === 'ERR_NETWORK') {
      return Promise.reject(
        new Error('Não foi possível contatar o servidor. Verifique sua conexão.')
      );
    }

    // 401 → limpar sessão e redirecionar
    if (status === 401 && typeof window !== 'undefined') {
      clearStoredSession();
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
