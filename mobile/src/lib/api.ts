// mobile/src/services/api.ts
import axios from 'axios';

const baseURL =
  (process.env.NEXT_PUBLIC_API_BASE ?? '').replace(/\/$/, '') ||
  'http://localhost:3333/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: { Accept: 'application/json' },
});

// Log da base em dev
if (process.env.NODE_ENV !== 'production') {
  // eslint-disable-next-line no-console
  console.log('[next api] baseURL =', api.defaults.baseURL);
}

/** Injeta/Remove o Authorization global do axios */
export function setAuthToken(token: string | null) {
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

/** Limpa sessão e header Authorization usados pelo AuthContext */
export function clearStoredSession() {
  try {
    localStorage.removeItem('ms_session');
    sessionStorage.removeItem('ms_session');
  } catch {}
  delete api.defaults.headers.common.Authorization;
}

/** (Opcional) Interceptor de request — se quiser puxar token do storage aqui */
api.interceptors.request.use((config) => {
  // Se você quiser recuperar token salvo automaticamente:
  // const raw = localStorage.getItem('ms_session') || sessionStorage.getItem('ms_session');
  // if (raw) {
  //   const { token } = JSON.parse(raw);
  //   if (token) {
  //     config.headers = config.headers ?? {};
  //     (config.headers as any).Authorization = `Bearer ${token}`;
  //   }
  // }
  return config;
});

/** Interceptor de resposta com log detalhado de erros */
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const info = {
      code: err?.code,
      message: err?.message,
      status: err?.response?.status,
      data: err?.response?.data,
      baseURL: err?.config?.baseURL,
      url: err?.config?.url,
      method: err?.config?.method,
      timeout: err?.config?.timeout,
    };
    // eslint-disable-next-line no-console
    console.warn('[next api] FAIL', info);
    return Promise.reject(err);
  }
);
