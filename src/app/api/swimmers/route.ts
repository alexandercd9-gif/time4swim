import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET: Obtener nadadores
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    // Obtener usuario para verificar role
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    let children;

    // Si es ADMIN, puede ver todos los nadadores
    // Si es PARENT, solo ve sus propios hijos
    if (user.role === 'ADMIN') {
      children = await prisma.child.findMany({
        include: {
          _count: {
            select: {
              records: true,
              trainings: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    } else {
      // Para parents, obtener solo los hijos asociados a través de UserChild
      const userChildRelations = await (prisma as any).userChild.findMany({
        where: {
          userId: decoded.userId,
          isActive: true
        },
        include: {
          child: {
            include: {
              _count: {
                select: {
                  records: true,
                  trainings: true
                }
              }
            }
          }
        }
      });
      
      children = userChildRelations.map((relation: any) => relation.child);
    }

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo nadador
export async function POST(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    
    const body = await request.json();
    const { name, birthDate, gender, clubId, coach, photo, fdpnAffiliateCode } = body;

    console.log('📝 Datos recibidos:', {
      name,
      birthDate,
      gender,
      clubId,
      coach,
      fdpnAffiliateCode,
      photoLength: photo?.length || 0,
      photoType: typeof photo
    });

    // Validaciones básicas
    if (!name || !birthDate || !gender) {
      return NextResponse.json(
        { message: 'Nombre, fecha de nacimiento y género son requeridos' },
        { status: 400 }
      );
    }

    if (!['MALE', 'FEMALE'].includes(gender)) {
      return NextResponse.json(
        { message: 'Género debe ser MALE o FEMALE' },
        { status: 400 }
      );
    }

    console.log('🏊 Creando nadador con datos:', {
      name,
      birthDate: new Date(birthDate),
      gender,
      clubId: clubId || null,
      coach: coach || null,
      fdpnAffiliateCode: fdpnAffiliateCode || null,
      photoLength: photo?.length || 0,
      userId: decoded.userId
    });

    // Crear nadador
    const child = await (prisma as any).child.create({
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        coach: coach || null,
        photo: photo || null,
        fdpnAffiliateCode: fdpnAffiliateCode || null,
        clubId: clubId || null
      },
      include: {
        _count: {
          select: {
            records: true,
            trainings: true
          }
        }
      }
    });

    // Crear relación parent-child
    await (prisma as any).userChild.create({
      data: {
        userId: decoded.userId,
        childId: child.id
      }
    });

    return NextResponse.json(child, { status: 201 });
  } catch (error) {
    console.error('Error creating child:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}