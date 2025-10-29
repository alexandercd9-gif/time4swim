import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

// GET: Obtener todos los padres
export async function GET() {
  try {
    const parents = await (prisma as any).user.findMany({
      where: {
        role: UserRole.PARENT
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        parentType: true,
        createdAt: true,
        _count: {
          select: {
            children: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(parents);
  } catch (error) {
    console.error('Error fetching parents:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo padre
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, parentType } = await request.json();

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const newParent = await (prisma as any).user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.PARENT,
        parentType: parentType || null
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        parentType: true,
        createdAt: true,
        _count: {
          select: {
            children: true
          }
        }
      }
    });

    return NextResponse.json(newParent, { status: 201 });
  } catch (error) {
    console.error('Error creating parent:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}