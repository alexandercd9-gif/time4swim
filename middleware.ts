import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-jwt-key'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const { pathname } = request.nextUrl

  let userRole: string | null = null

  // Decodificar token para obtener el rol
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { role?: string }
      userRole = decoded.role?.toUpperCase() || null
    } catch (err) {
      // Token inválido, eliminar cookie
      const response = NextResponse.redirect(new URL('/login', request.url))
      response.cookies.delete('token')
      return response
    }
  }

  // Si no hay token y no está en login, redirigir a login
  if (!token && !pathname.includes('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token y está en login, redirigir al dashboard según rol
  if (token && pathname.includes('/login')) {
    switch (userRole) {
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      case 'PARENTS':
      case 'PARENT':
        return NextResponse.redirect(new URL('/parents/dashboard', request.url))
      case 'CLUB':
        return NextResponse.redirect(new URL('/club/dashboard', request.url))
      case 'PROFESOR':
      case 'TEACHER':
        return NextResponse.redirect(new URL('/profesor/dashboard', request.url))
      default:
        return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protección de rutas por rol
  if (token && userRole) {
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    if (pathname.startsWith('/parents') && userRole !== 'PARENTS' && userRole !== 'PARENT') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
    // Permitir acceso a resultados para profesores y club
    if (pathname.startsWith('/club')) {
      const isResultsPage = pathname.includes('/results');
      if (!isResultsPage && userRole !== 'CLUB') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      // Si es página de resultados, permitir acceso a CLUB y PROFESOR
      if (isResultsPage && userRole !== 'CLUB' && userRole !== 'PROFESOR' && userRole !== 'TEACHER') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
    }
    if (pathname.startsWith('/profesor') && userRole !== 'PROFESOR' && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/parents/:path*', 
    '/club/:path*',
    '/profesor/:path*',
    '/login'
  ]
}
