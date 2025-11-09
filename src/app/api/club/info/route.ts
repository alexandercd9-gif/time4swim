import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET() {
  try {
    // Obtener token de las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Obtener el club del usuario
    const userClubRelation = await prisma.userClub.findFirst({
      where: { userId: decoded.userId },
      include: {
        club: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            address: true,
          },
        },
      },
    });

    if (!userClubRelation) {
      return NextResponse.json(
        { error: "Usuario no asociado a un club" },
        { status: 404 }
      );
    }

    return NextResponse.json({ club: userClubRelation.club });
  } catch (err) {
    console.error("GET /api/club/info error", err);
    return NextResponse.json(
      { error: "Error al obtener información del club" },
      { status: 500 }
    );
  }
}
