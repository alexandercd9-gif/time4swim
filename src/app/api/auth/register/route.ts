import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }

    // Validar rol (debe ser uno de los roles válidos)
    const validRoles = ['PARENT', 'CLUB', 'TEACHER', 'ADMIN'];
    if (role && !validRoles.includes(role)) {
      return NextResponse.json(
        { message: 'Rol inválido' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'El correo electrónico ya está registrado' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 12);

    // Calcular fecha de expiración del trial (7 días desde ahora)
    const trialExpiresAt = new Date();
    trialExpiresAt.setDate(trialExpiresAt.getDate() + 7);

    // Crear usuario con cuenta trial
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'PARENT', // Usar el rol seleccionado o PARENT por defecto
        accountStatus: 'TRIAL',
        isTrialAccount: true,
        trialExpiresAt
      }
    });

    // Respuesta exitosa (sin incluir la contraseña)
    return NextResponse.json({
      message: 'Usuario registrado exitosamente',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role, // Incluir rol en la respuesta
        accountStatus: user.accountStatus,
        isTrialAccount: user.isTrialAccount,
        trialExpiresAt: user.trialExpiresAt
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}