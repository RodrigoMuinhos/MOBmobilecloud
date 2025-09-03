// src/services/api.ts
import axios from 'axios';
import type { FilialAPI } from '../types/api/filialApi.types';

// Lê do .env do Vite (frontend/.env) e cai no localhost se não existir
export const API_BASE =
  import.meta.env?.VITE_API_BASE_URL ?? 'http://localhost:3333/api';

// Útil para arquivos estáticos (/uploads) → http://localhost:3333
export const FILES_BASE = API_BASE.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: API_BASE,
});

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('TOKEN_MOB');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Exemplo de função já existente
export async function buscarFiliais(): Promise<FilialAPI[]> {
  const { data } = await api.get('/filiais');
  return data;
}

export default api;
