import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { connectDB } from '@/lib/db';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Extraer token del header o cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Token de acceso requerido" }, { status: 401 });
    }

    let decoded: jwt.JwtPayload | string;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (err) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 401 });
    }

    // Extraer userId correctamente
    const userId = typeof decoded === "string" ? undefined : decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: "Token sin userId" }, { status: 401 });
    }

    // 1. Intentar obtener usuario vía Prisma (OAuth + nuevos registros)
    try {
      const prismaUser = await prisma.user.findUnique({ where: { id: userId } });
      if (prismaUser) {
        return NextResponse.json({
          user: {
            id: prismaUser.id,
            name: prismaUser.name || prismaUser.email.split('@')[0],
            email: prismaUser.email,
            role: prismaUser.role, // e.g. PARENT
            isTrialAccount: !!prismaUser.isTrialAccount,
            accountStatus: prismaUser.accountStatus,
            trialExpiresAt: prismaUser.trialExpiresAt ? prismaUser.trialExpiresAt.toISOString() : null
          }
        });
      }
    } catch (prismaErr) {
      console.error('Error consultando usuario en Prisma:', prismaErr);
      // Continuar al fallback MySQL
    }

    // 2. Fallback: Buscar usuario en MySQL (usuarios legacy creados por flujo antiguo)
    let connection;
    try {
      connection = await connectDB();
      const [rows] = await connection.execute('SELECT * FROM user WHERE id = ?', [userId]);
      const users = rows as any[];
      if (!users || users.length === 0) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
      }
      const user = users[0];
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
          role: user.role || 'PARENT',
          isTrialAccount: !!user.isTrialAccount,
          accountStatus: user.accountStatus,
          trialExpiresAt: user.trialExpiresAt ? new Date(user.trialExpiresAt).toISOString() : null
        }
      });
    } catch (dbErr) {
      console.error('Error consultando usuario en MySQL:', dbErr);
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 });
    } finally {
      if (connection) {
        try { await connection.end(); } catch (e) { console.error('Error cerrando conexión:', e); }
      }
    }

  } catch (error) {
    console.error('Error en /api/auth/me:', error);
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    );
  }
}