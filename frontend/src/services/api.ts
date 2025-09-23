// src/services/api.ts
import axios from "axios";
import type { FilialAPI } from "../types/api/filialApi.types";

// Base da API vinda do .env do Vite (Vercel)
const RAW =
  import.meta.env?.VITE_API_BASE_URL || // ✅ principal (produção)
  import.meta.env?.VITE_API_URL ||      // (compat. com antigo, se existir)
  "http://localhost:3333/api";          // fallback para DEV local

// Normaliza: remove barra final e deriva base de arquivos (sem /api)
const API_BASE = RAW.replace(/\/+$/, "");
export const FILES_BASE = API_BASE.replace(/\/api$/, "");

// Instância do axios
const api = axios.create({ baseURL: API_BASE });

// Token JWT (se existir)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_MOB");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Exemplo
export async function buscarFiliais(): Promise<FilialAPI[]> {
  const { data } = await api.get("/filiais");
  return data;
}

export default api;
