import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_ROUTES = ['/login'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isPublic = PUBLIC_ROUTES.some(p => pathname.startsWith(p));

  const hasToken = req.cookies.get('MS_AUTH_TOKEN') // cookies não temos; usamos localStorage.
  // Como localStorage não existe no middleware, usamos fallback por URL:
  // Solução simples: proteger no client (layout da página) + aqui só evita /(tabs).
  if (pathname.startsWith('/(tabs)/')) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.replace('/(tabs)', '');
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

// OBS: Como token está no localStorage, a checagem forte de proteção está nos layouts das páginas.
// Para proteção 100% no edge, migre o token para cookie httpOnly (no backend) no futuro.
