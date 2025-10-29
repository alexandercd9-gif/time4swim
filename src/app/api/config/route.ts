import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Obtener configuraciones de estilos y tipos de piscina
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type'); // 'styles' o 'pools'

    if (type === 'styles') {
      const styles = await prisma.swimStyleConfig.findMany({
        where: { isActive: true },
        orderBy: { style: 'asc' }
      });
      return NextResponse.json(styles);
    } 
    
    if (type === 'pools') {
      const pools = await prisma.poolTypeConfig.findMany({
        where: { isActive: true },
        orderBy: { poolSize: 'asc' }
      });
      return NextResponse.json(pools);
    }

    // Si no se especifica tipo, devolver ambos
    const [styles, pools] = await Promise.all([
      prisma.swimStyleConfig.findMany({
        where: { isActive: true },
        orderBy: { style: 'asc' }
      }),
      prisma.poolTypeConfig.findMany({
        where: { isActive: true },
        orderBy: { poolSize: 'asc' }
      })
    ]);

    return NextResponse.json({
      styles,
      pools
    });
  } catch (error) {
    console.error('Error fetching configurations:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}