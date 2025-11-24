import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

// GET: Obtener detalles del nadador
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const childId = resolvedParams.id;
    const auth = await requireAuth(request as any, ['ADMIN', 'PARENT']);

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
    if ((auth.user as any).role !== 'ADMIN') {
      const userChildRelation = child.parents.find(p => p.userId === auth.user.id);
      
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
    const auth = await requireAuth(request as any, ['ADMIN', 'PARENT']);

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
    if ((auth.user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userchild.findFirst({
        where: {
          userId: auth.user.id,
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
    console.log('📝 PUT /api/swimmers/[id] - Body recibido:', JSON.stringify(body, null, 2));
    const { name, birthDate, gender, clubId, coach, photo, fdpnAffiliateCode } = body;
    console.log('📝 clubId extraído:', clubId);

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
    console.log('📝 Actualizando nadador con clubId:', clubId);
    const updatedChild = await prisma.child.update({
      where: { id: childId },
      data: {
        name,
        birthDate: new Date(birthDate),
        gender,
        clubId: clubId || null,
        coach: coach || null,
        photo: photo || null,
        fdpnAffiliateCode: fdpnAffiliateCode || null
      },
      include: {
        club: {
          select: {
            id: true,
            name: true
          }
        },
        _count: {
          select: {
            records: true,
            trainings: true
          }
        }
      }
    });

    console.log('✅ Nadador actualizado:', JSON.stringify(updatedChild, null, 2));
    return NextResponse.json(updatedChild);
  } catch (error) {
    console.error('Error updating child:', error);
    return NextResponse.json(
      { message: 'Error al procesar la solicitud', error: error instanceof Error ? error.message : 'Unknown error' },
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
    const auth = await requireAuth(request as any, ['ADMIN', 'PARENT']);

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
    if ((auth.user as any).role !== 'ADMIN') {
      const userChildRelation = await (prisma as any).userchild.findFirst({
        where: {
          userId: auth.user.id,
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