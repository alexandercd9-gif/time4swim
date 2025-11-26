import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Requiere ADMIN autenticado (usa cookie 'token' o Authorization)
    await requireAuth(request as unknown as Request, ['ADMIN'])

    const { email, password } = await request.json();
    const { id: clubId } = await params;

    // Validar datos requeridos
    if (!email || !password) {
      return NextResponse.json({ error: 'Email y contraseña son requeridos' }, { status: 400 });
    }

    // Verificar que el club existe
    const club = await (prisma as any).club.findUnique({
      where: { id: clubId }
    });

    if (!club) {
      return NextResponse.json({ error: 'Club no encontrado' }, { status: 404 });
    }

    // Verificar que el email no esté en uso
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'El email ya está en uso por otro usuario' }, { status: 400 });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario con rol CLUB
    const newUser = await (prisma as any).user.create({
      data: {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        email,
        password: hashedPassword,
        name: `Administrador ${club.name}`,
        role: 'CLUB',
        updatedAt: new Date()
      }
    });

    // Verificar si ya existe una relación UserClub para este club
    const existingUserClub = await (prisma as any).userClub.findFirst({
      where: { clubId }
    });

    if (existingUserClub) {
      // Actualizar la relación existente con el nuevo usuario
      await (prisma as any).userClub.update({
        where: { id: existingUserClub.id },
        data: { userId: newUser.id, isActive: true }
      });
    } else {
      // Crear nueva relación UserClub
      await (prisma as any).userClub.create({
        data: {
          id: `uc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: newUser.id,
          clubId: clubId,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Credenciales creadas exitosamente',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('Error creating club credentials:', error);
    return NextResponse.json({ 
      error: 'Error interno del servidor' 
    }, { status: 500 });
  }
}