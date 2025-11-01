import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// PUT - Actualizar un club (solo ADMIN)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Requiere ADMIN autenticado (usa cookie "token" o Authorization)
    await requireAuth(request as unknown as Request, ['ADMIN'])

    const body = await request.json()
    const { name, address, phone, email, website, description } = body

    if (!name) {
      return NextResponse.json({ error: 'El nombre del club es requerido' }, { status: 400 })
    }

    // Verificar que el club existe
    const existingClub = await (prisma as any).club.findUnique({ where: { id } })

    if (!existingClub) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    // Verificar que no hay otro club con el mismo nombre (excepto el actual)
    const duplicateClub = await (prisma as any).club.findFirst({
      where: { name, id: { not: id } }
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
  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Error interno del servidor'
    console.error('Error al actualizar club:', error)
    return NextResponse.json({ error: message }, { status })
  }
}

// DELETE - Desactivar un club (solo ADMIN)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // Requiere ADMIN autenticado
    await requireAuth(request as unknown as Request, ['ADMIN'])

    // Verificar que el club existe
    const existingClub = await (prisma as any).club.findUnique({ where: { id } })

    if (!existingClub) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 })
    }

    // Desactivar el club en lugar de eliminarlo
    const deactivatedClub = await (prisma as any).club.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({ message: 'Club desactivado exitosamente' })
  } catch (error: any) {
    const status = error?.statusCode || 500
    const message = error?.message || 'Error interno del servidor'
    console.error('Error al desactivar club:', error)
    return NextResponse.json({ error: message }, { status })
  }
}