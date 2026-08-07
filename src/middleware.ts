import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyJwtToken } from '@/lib/auth'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get('auth_token')?.value

  const isAuthPage = pathname === '/admin/login'
  const isAdminRoute = pathname.startsWith('/admin')

  // Se não estiver acessando rota admin, libera
  if (!isAdminRoute) {
    return NextResponse.next()
  }

  // Verifica o token JWT
  const user = token ? await verifyJwtToken(token) : null

  // Tentando acessar tela de login já estando autenticado
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url))
  }

  // Tentando acessar rota admin sem estar logado
  if (!isAuthPage && !user) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
