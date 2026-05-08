import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Verificar se é uma rota admin
  if (pathname.startsWith('/admin')) {
    // Verificar se o usuário está autenticado (ver cookie de sessão)
    const supabaseSession = request.cookies.get('sb-access-token')?.value;
    
    // Se não houver sessão e não estiver na página de login, redirecionar
    if (!supabaseSession && !pathname.startsWith('/admin/login')) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
