import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient, UserRole } from '@prisma/client'
import * as jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// GET - Listar usuarios de club (solo ADMIN)
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Obtener usuario para verificar role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado - Solo administradores' }, { status: 401 })
    }

    // Obtener usuarios de club con sus clubes asignados
    const clubUsers = await (prisma as any).user.findMany({
      where: {
        OR: [
          { role: 'CLUB' },
          { role: 'TEACHER' }
        ]
      },
      include: {
        clubs: {
          include: {
            club: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(clubUsers)
  } catch (error) {
    console.error('Error al obtener usuarios de club:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear nuevo usuario de club (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Obtener usuario para verificar role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'No autorizado - Solo administradores' }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, clubId } = body

    if (!name || !email || !password || !clubId) {
      return NextResponse.json({ error: 'Todos los campos son requeridos' }, { status: 400 })
    }

    // Verificar que no existe un usuario con el mismo email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'Ya existe un usuario con este email' }, { status: 400 })
    }

    // Verificar que el club existe
    const club = await (prisma as any).club.findUnique({
      where: { id: clubId }
    })

    if (!club) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario y asociarlo al club en una transacción
    const result = await (prisma as any).$transaction(async (tx: any) => {
      // Crear usuario
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: 'CLUB'
        }
      })

      // Asociar usuario al club
      await tx.userClub.create({
        data: {
          userId: newUser.id,
          clubId: clubId
        }
      })

      return newUser
    })

    return NextResponse.json({ 
      id: result.id, 
      name: result.name, 
      email: result.email, 
      role: result.role,
      message: 'Usuario de club creado exitosamente' 
    }, { status: 201 })

  } catch (error) {
    console.error('Error al crear usuario de club:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}