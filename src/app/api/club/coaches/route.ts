import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    
    // Obtener el club del usuario
    const userClubRelation = await (prisma as any).userclub.findFirst({
      where: { userId: auth.user.id },
    });

    if (!userClubRelation && auth.user.role !== 'ADMIN') {
      return NextResponse.json({ coaches: [] }, { status: 200 });
    }

    const clubId = userClubRelation?.clubId;

    // Obtener profesores del club (usuarios con rol TEACHER asociados al club)
    const coaches = await prisma.user.findMany({
      where: {
        role: 'TEACHER',
        ...(clubId ? {
          userclub: {
            some: {
              clubId,
            },
          },
        } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json({ coaches });
  } catch (err) {
    console.error('GET /api/club/coaches error', err);
    return NextResponse.json({ coaches: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    
    const body = await request.json();
    const { name, email, password, photo } = body;

    // Validaciones
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Verificar que el email no exista
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este correo electrónico' },
        { status: 400 }
      );
    }

    // Obtener el clubId del usuario autenticado
    const userClubRelation = await (prisma as any).userclub.findFirst({
      where: { userId: auth.user.id },
    });

    if (!userClubRelation && auth.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes un club asociado' },
        { status: 400 }
      );
    }

    const clubId = userClubRelation?.clubId;

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el entrenador
    const coach = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'TEACHER',
        accountStatus: 'ACTIVE',
        isTrialAccount: false,
        profilePhoto: photo || null,
        userclub: clubId ? {
          create: {
            id: `UC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            clubId,
            isActive: true,
            updatedAt: new Date(),
          },
        } : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({
      success: true,
      coach,
      message: 'Entrenador creado exitosamente',
    });
  } catch (err: any) {
    console.error('POST /api/club/coaches error', err);
    return NextResponse.json(
      { error: 'Error al crear entrenador: ' + err.message },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await requireAuth(request as any, ['CLUB', 'ADMIN']);
    
    const body = await request.json();
    const { id, name, email, password, photo } = body;

    // Validaciones
    if (!id || !name || !email) {
      return NextResponse.json(
        { error: 'ID, nombre y email son requeridos' },
        { status: 400 }
      );
    }

    // Verificar que el entrenador existe
    const existingCoach = await prisma.user.findUnique({
      where: { id },
      include: { userclub: true },
    });

    if (!existingCoach || existingCoach.role !== 'TEACHER') {
      return NextResponse.json(
        { error: 'Entrenador no encontrado' },
        { status: 404 }
      );
    }

    // Verificar que el email no esté siendo usado por otro usuario
    if (email !== existingCoach.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: 'El correo electrónico ya está en uso' },
          { status: 400 }
        );
      }
    }

    // Preparar datos de actualización
    const updateData: any = {
      name,
      email,
    };

    // Si se proporciona foto, actualizarla
    if (photo !== undefined) {
      updateData.profilePhoto = photo || null;
    }

    // Si se proporciona contraseña, actualizarla
    if (password && password.length >= 6) {
      updateData.password = await bcrypt.hash(password, 10);
    } else if (password && password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres' },
        { status: 400 }
      );
    }

    // Actualizar el entrenador
    const coach = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePhoto: true,
      },
    });

    return NextResponse.json({
      success: true,
      coach,
      message: 'Entrenador actualizado exitosamente',
    });
  } catch (err: any) {
    console.error('PUT /api/club/coaches error', err);
    return NextResponse.json(
      { error: 'Error al actualizar entrenador: ' + err.message },
      { status: 500 }
    );
  }
}
