// src/services/api.ts
import axios from 'axios';
import type { FilialAPI } from '../types/api/filialApi.types';

const api = axios.create({
  baseURL: 'http://localhost:3333/api', // ou a URL de produção
});

// Interceptor para token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('TOKEN_MOB');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 🔽 Adicione aqui:
export async function buscarFiliais(): Promise<FilialAPI[]> {
  const { data } = await api.get('/filiais');
  return data;
}

export default api;
