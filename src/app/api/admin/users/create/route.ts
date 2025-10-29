import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

// POST: Crear nuevo usuario (solo admin)
export async function POST(request: NextRequest) {
  try {
    const { user: adminUser } = await requireAuth(request, ['ADMIN']);
    
    const { 
      name, 
      email, 
      password, 
      role, 
      isTrialAccount, 
      trialDays 
    } = await request.json();

    // Validaciones básicas
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el email no existe
    const existingUser = await (prisma as any).user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ya existe un usuario con este email' },
        { status: 400 }
      );
    }

    // Hash de la contraseña
    const hashedPassword = await hash(password, 12);

    // Preparar datos del usuario
    const userData: any = {
      name,
      email,
      password: hashedPassword,
      role,
      accountStatus: isTrialAccount ? 'TRIAL' : 'ACTIVE',
      isTrialAccount: isTrialAccount || false,
    };

    // Si es trial, calcular fecha de expiración
    if (isTrialAccount && trialDays) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + trialDays);
      userData.trialExpiresAt = expirationDate;
    }

    // Crear usuario
    const newUser = await (prisma as any).user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        isTrialAccount: true,
        trialExpiresAt: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      message: 'Usuario creado exitosamente',
      user: newUser
    });

  } catch (error) {
    console.error('Error creando usuario:', error);
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}