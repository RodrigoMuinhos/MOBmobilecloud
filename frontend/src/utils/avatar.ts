// src/utils/avatar.ts
export const PLACEHOLDER = '/user-placeholder.png';

function computeFilesBase(): string {
  const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
  if (apiBase) return apiBase.replace(/\/api\/?$/, ''); // http://localhost:3333
  if (typeof window !== 'undefined') {
    if (window.location.port === '5173') return 'http://localhost:3333';
    return window.location.origin;
  }
  return '';
}
const FILES_BASE = computeFilesBase();

export function resolveAvatar(url?: string | null): string {
  if (!url) return PLACEHOLDER;
  let u = String(url).trim();
  if (!u) return PLACEHOLDER;

  if (/^(https?:|data:|blob:)/i.test(u)) return u;        // absolutas / data / preview blob
  u = u.replace(/\\/g, '/').replace(/^(\.\/|public\/)/, '');

  if (!/^\/?uploads\//i.test(u)) u = `uploads/${u.replace(/^\/+/, '')}`; // garante "uploads/"
  const pathOnly = u.startsWith('/') ? u : `/${u}`;
  return FILES_BASE ? `${FILES_BASE}${pathOnly}` : pathOnly;
}
