import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
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
    
    // Obtener estadísticas del usuario
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener los hijos del usuario a través de UserChild
    const userChildren = await (prisma as any).userchild.findMany({
      where: {
        userId: decoded.userId,
        isActive: true
      },
      include: {
        child: {
          include: {
            trainings: true,
            records: true
          }
        }
      }
    });

    // Calcular estadísticas
    const totalChildren = userChildren.length;
    const totalTrainings = userChildren.reduce((total: number, relation: any) => total + relation.child.trainings.length, 0);
    const totalRecords = userChildren.reduce((total: number, relation: any) => total + relation.child.records.length, 0);
    
    // Calcular días desde registro
    const joinedDate = new Date(user.createdAt);
    const currentDate = new Date();
    const joinedDaysAgo = Math.floor((currentDate.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24));

    const stats = {
      totalChildren,
      totalTrainings,
      totalRecords,
      joinedDaysAgo
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}