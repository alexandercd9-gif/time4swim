import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import * as jwt from "jsonwebtoken";

const prisma = new PrismaClient();

// GET: Obtener los hijos del padre logueado con sus familiares asociados
export async function GET(request: NextRequest) {
  try {
    // Obtener token de las cookies
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };

    // Obtener los hijos del padre actual
    const userChildRelations = await (prisma as any).userChild.findMany({
      where: {
        userId: decoded.userId,
        isActive: true
      },
      include: {
        child: {
          include: {
            parents: {
              where: {
                isActive: true
              },
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                    parentType: true
                  }
                }
              }
            },
            club: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    });

    // Extraer solo los datos de los hijos
    const children = userChildRelations.map((relation: any) => relation.child);

    return NextResponse.json(children);
  } catch (error) {
    console.error('Error fetching family children:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}