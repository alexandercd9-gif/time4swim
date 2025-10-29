import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'
import { UserRole } from '@prisma/client'
import { db, prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  fullName: string
}

export class AuthError extends Error {
  constructor(message: string, public statusCode: number = 401) {
    super(message)
    this.name = 'AuthError'
  }
}

export class AuthMiddleware {
  // Extract and verify JWT token
  static async verifyToken(request: NextRequest): Promise<AuthUser> {
    const authHeader = request.headers.get('Authorization')
    const token = authHeader?.replace('Bearer ', '') || request.cookies.get('token')?.value

    if (!token) {
      throw new AuthError('Token de acceso requerido', 401)
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any
      
      // Verify user still exists and is active
      const user = await db.findUserById(decoded.userId)

      if (!user || !user.isActive) {
        throw new AuthError('Usuario no válido o inactivo', 401)
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: (user as any).fullName || (user as any).name || 'Usuario'
      }
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        throw new AuthError('Token inválido', 401)
      }
      if (error instanceof jwt.TokenExpiredError) {
        throw new AuthError('Token expirado', 401)
      }
      throw error
    }
  }

  // Check if user has required role
  static checkRole(user: AuthUser, allowedRoles: UserRole[]): boolean {
    return allowedRoles.includes(user.role)
  }

  // Check if user can access specific child
  static async checkChildAccess(userId: string, childId: string): Promise<boolean> {
    try {
      const user = await db.findUserById(userId)
      
      if (!user) return false
      
      // Admin can access all children
      if (user.role === UserRole.ADMIN) return true
      
      // Check if user is parent of the child
      if (user.role === UserRole.PARENT) {
        const userChildren = await db.findUserChildren(userId)
        return userChildren.some((uc: any) => uc.childId === childId)
      }
      
      // Teachers and club admins can access children in their clubs
      if ((user.role as string) === 'TEACHER' || (user.role as string) === 'CLUB') {
        const userClubs = await db.findUserClubs(userId)
        const child = await db.findChildById(childId)
        
        if (!child) return false
        
        return userClubs.some((uc: any) => uc.clubId === child.clubId)
      }
      
      return false
    } catch (error) {
      console.error('Error checking child access:', error)
      return false
    }
  }

  // Check if user can access specific club
  static async checkClubAccess(userId: string, clubId: string): Promise<boolean> {
    try {
      const user = await db.findUserById(userId)
      
      if (!user) return false
      
      // Admin can access all clubs
      if (user.role === UserRole.ADMIN) return true
      
      // Check if user is associated with this club
      if ((user.role as string) === 'TEACHER' || (user.role as string) === 'CLUB') {
        const userClubs = await db.findUserClubs(userId)
        return userClubs.some((uc: any) => uc.clubId === clubId)
      }
      
      return false
    } catch (error) {
      console.error('Error checking club access:', error)
      return false
    }
  }

  // Create authentication middleware wrapper
  static withAuth(
    handler: (request: NextRequest, user: AuthUser, ...args: any[]) => Promise<NextResponse>,
    options: {
      allowedRoles?: UserRole[]
      requireChildAccess?: boolean
      requireClubAccess?: boolean
    } = {}
  ) {
    return async (request: NextRequest, context?: any) => {
      try {
        // Verify token and get user
        const user = await this.verifyToken(request)

        // Check role permissions
        if (options.allowedRoles && !this.checkRole(user, options.allowedRoles)) {
          return NextResponse.json(
            { error: 'Acceso denegado: permisos insuficientes' },
            { status: 403 }
          )
        }

        // Check child access if required
        if (options.requireChildAccess && context?.params?.id) {
          const hasAccess = await this.checkChildAccess(user.id, context.params.id)
          if (!hasAccess) {
            return NextResponse.json(
              { error: 'Acceso denegado: no tienes permisos para este niño' },
              { status: 403 }
            )
          }
        }

        // Check club access if required
        if (options.requireClubAccess && context?.params?.id) {
          const hasAccess = await this.checkClubAccess(user.id, context.params.id)
          if (!hasAccess) {
            return NextResponse.json(
              { error: 'Acceso denegado: no tienes permisos para este club' },
              { status: 403 }
            )
          }
        }

        // Call the actual handler
        return handler(request, user, context)
      } catch (error) {
        if (error instanceof AuthError) {
          return NextResponse.json(
            { error: error.message },
            { status: error.statusCode }
          )
        }
        
        console.error('Authentication error:', error)
        return NextResponse.json(
          { error: 'Error interno del servidor' },
          { status: 500 }
        )
      }
    }
  }

  // Generate JWT token
  static generateToken(user: AuthUser): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        fullName: user.fullName
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    )
  }

  // Validate request data with Zod schema
  static async validateRequest<T>(
    request: NextRequest,
    schema: any
  ): Promise<T> {
    try {
      const body = await request.json()
      const result = schema.safeParse(body)
      
      if (!result.success) {
        throw new AuthError(
          `Datos inválidos: ${result.error.errors.map((e: any) => e.message).join(', ')}`,
          400
        )
      }
      
      return result.data
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new AuthError('JSON inválido', 400)
      }
      throw error
    }
  }
}

// Utility functions for common auth checks
export const requireAdmin = (allowedRoles: UserRole[] = [UserRole.ADMIN]) => ({
  allowedRoles
})

export const requireParentOrAdmin = (allowedRoles: UserRole[] = [UserRole.PARENT, UserRole.ADMIN]) => ({
  allowedRoles
})

export const requireChildAccess = (allowedRoles: UserRole[] = [UserRole.PARENT, UserRole.ADMIN]) => ({
  allowedRoles,
  requireChildAccess: true
})

export const requireClubAccess = (allowedRoles: UserRole[] = [UserRole.ADMIN]) => ({
  allowedRoles,
  requireClubAccess: true
})

// Simplified auth function for API routes
export async function requireAuth(request: Request, allowedRoles: string[] = []) {
  const authHeader = request.headers.get('Authorization')
  const token = authHeader?.replace('Bearer ', '') || 
                new URL(request.url).searchParams.get('token') ||
                request.headers.get('Cookie')?.match(/token=([^;]+)/)?.[1]

  if (!token) {
    throw new AuthError('Token de acceso requerido', 401)
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any
    
    // Verify user still exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!user) {
      throw new AuthError('Usuario no válido', 401)
    }

    // Check role authorization
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role as string)) {
      throw new AuthError('No autorizado para esta acción', 403)
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name || 'Usuario'
      }
    }
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthError('Token inválido', 401)
    }
    throw error
  }
}