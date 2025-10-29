import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// GET - Listar todos los clubes activos
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Obtener usuario para verificar que existe
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const clubs = await (prisma as any).club.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(clubs)
  } catch (error) {
    console.error('Error al obtener clubes:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// POST - Crear un nuevo club (solo ADMIN)
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
    const { name, address, phone, email, website, description } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre del club es requerido' }, { status: 400 })
    }

    // Verificar que no existe un club con el mismo nombre
    const existingClub = await (prisma as any).club.findUnique({
      where: { name }
    })

    if (existingClub) {
      return NextResponse.json({ error: 'Ya existe un club con este nombre' }, { status: 400 })
    }

    const club = await (prisma as any).club.create({
      data: {
        name,
        address,
        phone,
        email,
        website,
        description
      }
    })

    return NextResponse.json(club, { status: 201 })
  } catch (error) {
    console.error('Error al crear club:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}