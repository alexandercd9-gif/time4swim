import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value
  const userRole = request.cookies.get('user-role')?.value
  const { pathname } = request.nextUrl

  // Si no hay token y no está en login, redirigir a login
  if (!token && !pathname.includes('/login')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Si hay token y está en login, redirigir al dashboard según rol
  if (token && pathname.includes('/login')) {
    switch (userRole) {
      case 'ADMIN':
        return NextResponse.redirect(new URL('/admin/dashboard', request.url))
      case 'PARENT':
        return NextResponse.redirect(new URL('/parents/dashboard', request.url))
      case 'CLUB':
        return NextResponse.redirect(new URL('/club/dashboard', request.url))
      case 'TEACHER':
        return NextResponse.redirect(new URL('/profesor/dashboard', request.url))
      default:
        return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Protección de rutas por rol
  if (token) {
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/parents') && userRole !== 'PARENT') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/club') && userRole !== 'CLUB') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
    }
    if (pathname.startsWith('/profesor') && userRole !== 'TEACHER') {
      return NextResponse.redirect(new URL('/unauthorized', request.url))
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
