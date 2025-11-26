import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const maxDuration = 60;

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req, ['PARENT']);
    
    const { searchParams } = new URL(req.url);
    const mediaId = searchParams.get('mediaId');
    
    if (!mediaId) {
      return NextResponse.json(
        { error: 'mediaId es requerido' },
        { status: 400 }
      );
    }

    // Get media details
    const media = await prisma.media.findUnique({
      where: { id: mediaId }
    });

    if (!media) {
      return NextResponse.json(
        { error: 'Media no encontrada' },
        { status: 404 }
      );
    }

    // Get media swimmers and check if any belongs to this parent
    const mediaSwimmers = await prisma.mediaswimmer.findMany({
      where: { mediaId },
      select: { childId: true }
    });

    if (mediaSwimmers.length === 0) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este archivo' },
        { status: 403 }
      );
    }

    // Check if any of the swimmers belongs to this parent
    const childIds = mediaSwimmers.map((ms: any) => ms.childId);
    const userChildren = await (prisma as any).userchild.findMany({
      where: {
        userId: user.user.id,
        childId: { in: childIds },
        isActive: true
      }
    });

    if (userChildren.length === 0) {
      return NextResponse.json(
        { error: 'No tienes permiso para eliminar este archivo' },
        { status: 403 }
      );
    }

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/[cloud]/[type]/upload/[version]/[public_id].[ext]
    const urlParts = media.cloudinaryUrl.split('/');
    const uploadIndex = urlParts.findIndex(part => part === 'upload');
    
    if (uploadIndex === -1) {
      return NextResponse.json(
        { error: 'URL de Cloudinary inválida' },
        { status: 400 }
      );
    }

    // Get public_id (everything after upload/ including folder structure)
    const pathAfterUpload = urlParts.slice(uploadIndex + 1).join('/');
    // Remove version if present (v1234567890)
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    // Remove file extension
    const publicId = pathWithoutVersion.replace(/\.[^.]+$/, '');

    // Determine resource type
    const resourceType = media.type === 'VIDEO' ? 'video' : 'image';

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(publicId, { 
        resource_type: resourceType,
        invalidate: true 
      });
      console.log(`Deleted from Cloudinary: ${publicId}`);
    } catch (cloudinaryError) {
      console.error('Error deleting from Cloudinary:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Delete from database
    await prisma.media.delete({
      where: { id: mediaId }
    });

    return NextResponse.json({ 
      success: true,
      message: 'Archivo eliminado correctamente'
    });

  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Error al eliminar archivo' },
      { status: 500 }
    );
  }
}
