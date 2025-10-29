import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET: Obtener detalles del nadador
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;

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

    // Obtener detalles completos del nadador
    const child = await prisma.child.findUnique({
      where: { id: childId },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        parents: {
          where: { isActive: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        records: {
          orderBy: { date: 'desc' },
          take: 20
        },
        trainings: {
          orderBy: { date: 'desc' },
          take: 10
        }
      }
    });

    if (!child) {
      return NextResponse.json(
        { message: 'Nadador no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: ADMIN puede ver cualquier nadador, PARENT solo los suyos
    if ((user as any).role !== 'ADMIN') {
      const userChildRelation = child.parents.find(p => p.userId === decoded.userId);
      
      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No autorizado para ver este nadador' },
          { status: 403 }
        );
      }
    }

    // Formatear respuesta
    const response = {
      id: child.id,
      name: child.name,
      firstName: (child as any).firstName,
      lastName: (child as any).lastName,
      birthDate: child.birthDate,
      gender: child.gender,
      coach: child.coach,
      photo: child.photo,
      club: child.club,
      user: child.parents[0]?.user || null,
      records: child.records,
      trainings: child.trainings,
      fdpnData: (child as any).fdpnData,
      fdpnLastSync: (child as any).fdpnLastSync
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching child details:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar nadador
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;

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

    // Verificar que el nadador existe
    const existingChild = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!existingChild) {
      return NextResponse.json(
        { message: 'Nadador no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: ADMIN puede editar cualquier nadador, PARENT solo los suyos
    if ((user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userChild.findFirst({
        where: {
          userId: decoded.userId,
          childId: childId,
          isActive: true
        }
      });
      
      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No autorizado para editar este nadador' },
          { status: 403 }
        );
      }
    }

    const body = await request.json();
    const { name, birthDate, gender, club, coach, photo } = body;

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

    // Actualizar nadador
    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        club: club || null,
        coach: coach || null,
        photo: photo || null
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

    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar nadador
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;

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

    // Verificar que el nadador existe
    const existingChild = await prisma.child.findUnique({
      where: { id: childId }
    });

    if (!existingChild) {
      return NextResponse.json(
        { message: 'Nadador no encontrado' },
        { status: 404 }
      );
    }

    // Verificar permisos: ADMIN puede eliminar cualquier nadador, PARENT solo los suyos
    if ((user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userChild.findFirst({
        where: {
          userId: decoded.userId,
          childId: childId,
          isActive: true
        }
      });
      
      if (!userChildRelation) {
        return NextResponse.json(
          { message: 'No autorizado para eliminar este nadador' },
          { status: 403 }
        );
      }
    }

    // Eliminar nadador (esto también eliminará records y trainings por CASCADE)
    await prisma.child.delete({
      where: { id: childId }
    });

    return NextResponse.json({ message: 'Nadador eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting child:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}