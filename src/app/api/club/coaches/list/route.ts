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
      return NextResponse.json({ coaches: [] }, { status: 200 });
    }

    // Verificar token
    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ coaches: [] }, { status: 200 });
    }

    // Obtener el club del usuario
    const userClubRelation = await prisma.userClub.findFirst({
      where: { userId: decoded.userId },
    });

    if (!userClubRelation) {
      return NextResponse.json({ coaches: [] }, { status: 200 });
    }

    const clubId = userClubRelation.clubId;

    // Obtener entrenadores del club
    const coaches = await prisma.user.findMany({
      where: {
        role: "TEACHER",
        clubs: {
          some: {
            clubId,
            isActive: true,
          },
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        createdAt: true,
        clubs: {
          where: {
            clubId,
          },
          select: {
            isActive: true,
          },
        },
        _count: {
          select: {
            coachingLanes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ coaches });
  } catch (err) {
    console.error("GET /api/club/coaches/list error", err);
    return NextResponse.json({ coaches: [] }, { status: 200 });
  }
}
