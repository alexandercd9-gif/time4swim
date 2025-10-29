import { NextRequest, NextResponse } from "next/server";
import * as jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-aqui';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      );
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    // Obtener información actualizada del usuario
    const user = await (prisma as any).user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
        isTrialAccount: true,
        trialExpiresAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });

  } catch (error) {
    console.error('Error verifying user:', error);
    return NextResponse.json(
      { message: 'Token inválido' },
      { status: 401 }
    );
  }
}