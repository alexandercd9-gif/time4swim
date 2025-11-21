import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import * as jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    // Extraer token del header o cookie
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "") || request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Verificar token JWT
    let decoded: jwt.JwtPayload | string;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
    } catch (err) {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    const userId = typeof decoded === "string" ? undefined : decoded.userId;
    if (!userId) {
      return NextResponse.json({ error: "Usuario no identificado" }, { status: 401 });
    }

    const body = await request.json();
    const { 
      competitionName,
      competitionDate,
      childId,
      clubId,
      eventId,
      medal,
      position,
      uploadedMedias // Array de objetos con info de Cloudinary
    } = body;

    if (!uploadedMedias || uploadedMedias.length === 0) {
      return NextResponse.json(
        { error: 'No hay medias para guardar' },
        { status: 400 }
      );
    }

    // Crear registros en la BD para cada media
    const savedMedias = await Promise.all(
      uploadedMedias.map(async (media: any) => {
        const mediaRecord = await prisma.media.create({
          data: {
            type: media.resourceType === 'video' ? 'VIDEO' : 'PHOTO',
            cloudinaryPublicId: media.publicId,
            cloudinaryUrl: media.url,
            thumbnailUrl: media.thumbnailUrl,
            title: competitionName,
            description: `Competencia registrada por padre`,
            duration: media.duration,
            width: media.width,
            height: media.height,
            fileSize: media.fileSize,
            medal: medal,
            position: position,
            clubId: clubId,
            eventId: eventId || null,
            uploadedBy: userId,
            capturedAt: new Date(competitionDate),
          },
        });

        // Vincular el nadador con el media
        await prisma.mediaSwimmer.create({
          data: {
            mediaId: mediaRecord.id,
            childId: childId,
            lane: null, // El padre no especifica carril
          },
        });

        return mediaRecord;
      })
    );

    return NextResponse.json({
      success: true,
      savedCount: savedMedias.length,
      medias: savedMedias
    });

  } catch (error) {
    console.error('Error saving medias:', error);
    return NextResponse.json(
      { error: 'Error al guardar medias en base de datos' },
      { status: 500 }
    );
  }
}
