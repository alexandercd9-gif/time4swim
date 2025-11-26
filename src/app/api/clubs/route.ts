import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET - Listar todos los clubes activos
export async function GET(request: NextRequest) {
  try {
    // Autentica usando la utilidad común (acepta cookie "token" o Authorization)
    await requireAuth(request as unknown as Request)

    const clubs = await (prisma as any).club.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(clubs)
  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Error interno del servidor'
    console.error('Error al obtener clubes:', error)
    return NextResponse.json({ error: message }, { status })
  }
}

// POST - Crear un nuevo club (solo ADMIN)
export async function POST(request: NextRequest) {
  try {
    // Requiere autenticación (la función ya valida el token de cookie "token")
    const { user } = await requireAuth(request as unknown as Request, ['ADMIN'])

    const body = await request.json()
    const { name, address, phone, email, website, description } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre del club es requerido' }, { status: 400 })
    }

    // Verificar que no existe un club con el mismo nombre
    const existingClub = await (prisma as any).club.findFirst({
      where: { name }
    })

    if (existingClub) {
      return NextResponse.json({ error: 'Ya existe un club con este nombre' }, { status: 400 })
    }

    const club = await (prisma as any).club.create({
      data: { 
        id: `club_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        name, 
        address, 
        phone, 
        email, 
        website, 
        description,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(club, { status: 201 })
  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Error interno del servidor'
    console.error('Error al crear club:', error)
    return NextResponse.json({ error: message }, { status })
  }
}