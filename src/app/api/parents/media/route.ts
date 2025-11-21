import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAuth(request as any, ["PARENT"]);
    const { searchParams } = new URL(request.url);
    const childId = searchParams.get("childId");

    // Get user's subscription
    const subscription = await prisma.subscription.findUnique({
      where: { userId: auth.user.id },
      select: {
        mediaGalleryAddon: true,
        mediaGalleryIsFree: true,
      },
    });

    // Check if user has media access
    const hasAccess = subscription?.mediaGalleryAddon || subscription?.mediaGalleryIsFree || false;

    // Get allowed children IDs
    const relations = await (prisma as any).userChild.findMany({
      where: { userId: auth.user.id, isActive: true },
      select: { childId: true },
    });
    const allowedChildIds = relations.map((r: any) => r.childId);

    if (allowedChildIds.length === 0) {
      return NextResponse.json({ 
        hasAccess, 
        freeMedia: [], 
        lockedCount: 0,
        allMedia: [] 
      });
    }

    // Build query filter
    const whereClause: any = {
      swimmers: {
        some: {
          childId: childId && allowedChildIds.includes(childId) 
            ? childId 
            : { in: allowedChildIds }
        }
      }
    };

    // Get all media
    const allMedia = await prisma.media.findMany({
      where: whereClause,
      select: {
        id: true,
        type: true,
        cloudinaryUrl: true,
        thumbnailUrl: true,
        title: true,
        capturedAt: true,
        duration: true,
        medal: true,
        position: true,
        event: {
          select: {
            title: true,
            location: true,
          },
        },
        swimmers: {
          select: {
            lane: true,
            child: {
              select: {
                name: true,
              },
            },
          },
        },
        moments: {
          select: {
            time: true,
            label: true,
          },
          orderBy: {
            time: 'asc',
          },
        },
      },
      orderBy: {
        capturedAt: 'desc',
      },
    });

    if (hasAccess) {
      // User has full access
      return NextResponse.json({
        hasAccess: true,
        freeMedia: [],
        lockedCount: 0,
        allMedia,
      });
    } else {
      // User has limited access (only 2 free items)
      const freeMedia = allMedia.slice(0, 2);
      const lockedCount = Math.max(0, allMedia.length - 2);
      
      return NextResponse.json({
        hasAccess: false,
        freeMedia,
        lockedCount,
      });
    }
  } catch (error) {
    console.error("GET /api/parents/media error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
