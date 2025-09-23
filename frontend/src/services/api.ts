// src/services/api.ts
import axios from "axios";
import type { FilialAPI } from "../types/api/filialApi.types";

const RAW =
  import.meta.env?.VITE_API_BASE_URL || // produção (Vercel)
  import.meta.env?.VITE_API_URL ||      // compat c/ antigo
  "http://localhost:3333/api";          // fallback DEV

const API_BASE = RAW.replace(/\/+$/, "");
export const FILES_BASE = API_BASE.replace(/\/api$/, "");

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("TOKEN_MOB");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export async function buscarFiliais(): Promise<FilialAPI[]> {
  const { data } = await api.get("/filiais");
  return data;
}

export default api;
