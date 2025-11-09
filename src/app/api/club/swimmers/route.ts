import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string; email: string };

    if (decoded.role !== "CLUB") {
      return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
    }

    // Obtener el club del usuario
    // La estrategia es: el email del usuario club debe coincidir con el email del club en la BD
    // O buscar por coincidencia parcial en el nombre
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { 
        email: true,
        name: true 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
    }

    // Extraer el nombre del club del email (ej: deporclub@time4swim.com -> deporclub)
    const clubNameFromEmail = user.email.split('@')[0];

    // Buscar el club por coincidencia de nombre
    // MySQL es case-insensitive por defecto con collation utf8mb4_general_ci
    const club = await prisma.club.findFirst({
      where: {
        OR: [
          { email: user.email }, // Coincidencia exacta de email
          { name: { contains: clubNameFromEmail } }, // Nombre contiene el prefijo del email
          { name: { contains: user.name } } // Nombre contiene el nombre del usuario
        ]
      }
    });

    if (!club) {
      console.log("Club no encontrado para usuario:", user.email, "nombre:", user.name);
      return NextResponse.json({ 
        error: "Club no encontrado. Verifica que el nombre del club coincida con tu usuario.",
        debug: {
          userEmail: user.email,
          userName: user.name,
          clubNameSearched: clubNameFromEmail
        }
      }, { status: 404 });
    }

    console.log("✅ Club encontrado:", club.name, "ID:", club.id);

    // Obtener todos los nadadores asignados a este club
    const swimmers = await prisma.child.findMany({
      where: {
        clubId: club.id
      },
      include: {
        parents: {
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
        records: {
          orderBy: {
            date: 'desc'
          },
          take: 5 // Últimos 5 records
        },
        trainings: {
          orderBy: {
            date: 'desc'
          },
          take: 5 // Últimas 5 sesiones
        }
      },
      orderBy: {
        name: 'asc'
      }
    });

    console.log(`Nadadores encontrados para club ${club.name}:`, swimmers.length);

    // Calcular estadísticas por nadador
    const swimmersWithStats = swimmers.map(swimmer => {
      const totalRecords = swimmer.records.length;
      const totalTrainings = swimmer.trainings.length;
      
      // Calcular edad
      const birthDate = new Date(swimmer.birthDate);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return {
        ...swimmer,
        age,
        totalRecords,
        totalTrainings,
        personalBests: swimmer.records.filter(r => r.isPersonalBest).length
      };
    });

    return NextResponse.json({
      club: {
        id: club.id,
        name: club.name
      },
      swimmers: swimmersWithStats,
      total: swimmersWithStats.length
    });
  } catch (error) {
    console.error("Error fetching club swimmers:", error);
    return NextResponse.json(
      { error: "Error al obtener nadadores del club" },
      { status: 500 }
    );
  }
}
