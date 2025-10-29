import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from 'jsonwebtoken'

const prisma = new PrismaClient()

// PUT - Actualizar un club (solo ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verificar que el club existe
    const existingClub = await (prisma as any).club.findUnique({
      where: { id }
    })

    if (!existingClub) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    // Verificar que no hay otro club con el mismo nombre (excepto el actual)
    const duplicateClub = await (prisma as any).club.findFirst({
      where: { 
        name,
        id: { not: id }
      }
    })

    if (duplicateClub) {
      return NextResponse.json({ error: 'Ya existe otro club con este nombre' }, { status: 400 })
    }

    const updatedClub = await (prisma as any).club.update({
      where: { id },
      data: {
        name,
        address,
        phone,
        email,
        website,
        description
      }
    })

    return NextResponse.json(updatedClub)
  } catch (error) {
    console.error('Error al actualizar club:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}

// DELETE - Desactivar un club (solo ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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

    // Verificar que el club existe
    const existingClub = await (prisma as any).club.findUnique({
      where: { id }
    })

    if (!existingClub) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    // Desactivar el club en lugar de eliminarlo
    const deactivatedClub = await (prisma as any).club.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Club desactivado exitosamente' })
  } catch (error) {
    console.error('Error al desactivar club:', error)
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 })
  }
}