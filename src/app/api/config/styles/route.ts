import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Devuelve los estilos activos con nombre en español
export async function GET(request: NextRequest) {
  try {
    const styles = await prisma.swimStyleConfig.findMany({
      where: { isActive: true },
      select: {
        style: true,
        nameEs: true,
        nameEn: true,
        description: true
      },
      orderBy: { nameEs: "asc" }
    });
    return NextResponse.json(styles);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener estilos" }, { status: 500 });
  }
}
