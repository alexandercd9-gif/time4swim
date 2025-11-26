import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function PUT(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const body = await request.json();
    const { name, email } = body;

    // Verificar si el usuario existe
    const existingUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!existingUser) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Verificar si el email ya existe (excepto el usuario actual)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email }
      });

      if (emailExists) {
        return NextResponse.json(
          { message: 'El email ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Actualizar información
    const updatedUser = await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        name: name || existingUser.name,
        email: email || existingUser.email
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            userchild: true
          }
        }
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user info:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}