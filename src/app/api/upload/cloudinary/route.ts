import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Next.js 16 App Router - Configuración de límites
export const maxDuration = 300; // 5 minutos para videos muy grandes
export const dynamic = 'force-dynamic'; // No cachear esta ruta
export const runtime = 'nodejs'; // Usar Node.js runtime para mejor manejo de archivos grandes

export async function POST(request: NextRequest) {
  try {
    console.log('📤 Iniciando upload a Cloudinary...');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó archivo' },
        { status: 400 }
      );
    }

    console.log('📦 Archivo recibido:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024 / 1024).toFixed(2)} MB`
    });

    // Validar tamaño según tipo de archivo
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (isImage) {
      const maxImageSize = 2 * 1024 * 1024; // 2MB para imágenes
      if (file.size > maxImageSize) {
        return NextResponse.json(
          { 
            error: 'Imagen demasiado grande',
            details: `Las imágenes deben ser menores a 2MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB`
          },
          { status: 400 }
        );
      }
    } else if (isVideo) {
      const maxVideoSize = 35 * 1024 * 1024; // 35MB para videos (límite real interno)
      if (file.size > maxVideoSize) {
        return NextResponse.json(
          { 
            error: 'Video demasiado grande',
            details: `Los videos deben ser menores a 30MB. Tamaño actual: ${(file.size / 1024 / 1024).toFixed(2)}MB. Comprímelo en https://www.freeconvert.com/video-compressor (target: 35%)`
          },
          { status: 400 }
        );
      }
    }

    // Convertir File a buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    console.log('🔄 Convirtiendo a buffer... Tamaño:', buffer.length);

    // Subir a Cloudinary usando upload_stream
    console.log('☁️ Subiendo a Cloudinary...');
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'time4swim_media',
          resource_type: 'auto', // Detecta automáticamente foto o video
          folder: 'time4swim',
          chunk_size: 6000000, // 6MB chunks para archivos grandes
        },
        (error, result) => {
          if (error) {
            console.error('❌ Error en Cloudinary upload_stream:', error);
            reject(error);
          } else {
            console.log('✅ Upload exitoso a Cloudinary');
            resolve(result);
          }
        }
      );

      uploadStream.end(buffer);
    });

    const result = uploadResult as any;

    // Extraer información relevante
    const mediaData = {
      publicId: result.public_id,
      url: result.secure_url,
      thumbnailUrl: result.resource_type === 'video' 
        ? result.secure_url.replace(/\.(mp4|mov|avi)$/, '.jpg') // Cloudinary genera thumbnails automáticamente
        : result.secure_url,
      resourceType: result.resource_type, // 'image' o 'video'
      format: result.format,
      width: result.width,
      height: result.height,
      duration: result.duration || null, // Solo para videos
      fileSize: result.bytes,
      createdAt: result.created_at,
    };

    return NextResponse.json({
      success: true,
      media: mediaData
    });

  } catch (error: any) {
    console.error('❌ Error uploading to Cloudinary:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET,
      uploadPreset: process.env.CLOUDINARY_UPLOAD_PRESET,
    });
    return NextResponse.json(
      { 
        error: 'Error al subir archivo a Cloudinary',
        details: error.message || 'Unknown error',
        cloudinaryError: error.http_code || null
      },
      { status: 500 }
    );
  }
}
