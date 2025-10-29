import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar autenticación del admin usando cookies
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    } catch (error) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 });
    }

    // Verificar que el usuario sea ADMIN
    const adminUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado. Solo administradores pueden crear credenciales' }, { status: 403 });
    }

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
        email,
        password: hashedPassword,
        name: `Administrador ${club.name}`,
        role: 'CLUB'
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
        data: { userId: newUser.id }
      });
    } else {
      // Crear nueva relación UserClub
      await (prisma as any).userClub.create({
        data: {
          userId: newUser.id,
          clubId: clubId
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