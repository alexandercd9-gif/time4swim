import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'time4swim-encryption-key-32chars'; // Must be 32 bytes
const ALGORITHM = 'aes-256-cbc';

// Función para cifrar
function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Función para descifrar
function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// GET - Obtener configuración de MercadoPago (con Access Token enmascarado)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 });
    }

    const config = await prisma.systemConfig.findFirst({
      select: {
        mercadopagoPublicKey: true,
        mercadopagoAccessToken: true,
        mercadopagoMode: true
      }
    });

    if (!config || !config.mercadopagoPublicKey) {
      return NextResponse.json({
        mercadopagoPublicKey: "",
        mercadopagoAccessToken: "",
        mercadopagoMode: "test"
      });
    }

    // Desencriptar y enmascarar el Access Token
    let maskedAccessToken = "";
    if (config.mercadopagoAccessToken) {
      try {
        const decryptedToken = decrypt(config.mercadopagoAccessToken);
        // Mostrar solo primeros 20 caracteres
        maskedAccessToken = decryptedToken.substring(0, 20) + '••••••••••••••••••••';
      } catch (error) {
        console.error('Error decrypting token:', error);
      }
    }

    return NextResponse.json({
      mercadopagoPublicKey: config.mercadopagoPublicKey || "",
      mercadopagoAccessToken: maskedAccessToken,
      mercadopagoMode: config.mercadopagoMode || "test"
    });

  } catch (error) {
    console.error('Error fetching MercadoPago config:', error);
    return NextResponse.json({ error: 'Error al obtener configuración' }, { status: 500 });
  }
}

// POST - Guardar configuración de MercadoPago
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch {
      return NextResponse.json({ error: "Token inválido" }, { status: 401 });
    }

    // Verificar que es admin
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return NextResponse.json({ error: "Acceso solo para administradores" }, { status: 403 });
    }

    const { mercadopagoPublicKey, mercadopagoAccessToken, mercadopagoMode } = await req.json();

    // Validaciones
    if (!mercadopagoPublicKey || !mercadopagoAccessToken) {
      return NextResponse.json({ 
        error: 'Public Key y Access Token son requeridos' 
      }, { status: 400 });
    }

    if (!['test', 'live'].includes(mercadopagoMode)) {
      return NextResponse.json({ 
        error: 'Modo inválido. Debe ser "test" o "live"' 
      }, { status: 400 });
    }

    // Validar formato de credenciales
    const keyPrefix = mercadopagoMode === 'test' ? 'TEST-' : 'APP_USR-';
    
    if (!mercadopagoPublicKey.startsWith(keyPrefix)) {
      return NextResponse.json({ 
        error: `La Public Key debe comenzar con ${keyPrefix}` 
      }, { status: 400 });
    }

    // Solo validar si no es un token enmascarado
    if (!mercadopagoAccessToken.includes('••••')) {
      if (!mercadopagoAccessToken.startsWith(keyPrefix)) {
        return NextResponse.json({ 
          error: `El Access Token debe comenzar con ${keyPrefix}` 
        }, { status: 400 });
      }
    }

    // Cifrar el Access Token (solo si no está enmascarado)
    let encryptedAccessToken = mercadopagoAccessToken;
    if (!mercadopagoAccessToken.includes('••••')) {
      encryptedAccessToken = encrypt(mercadopagoAccessToken);
    } else {
      // Si está enmascarado, mantener el valor existente en la BD
      const existingConfig = await prisma.systemConfig.findFirst();
      encryptedAccessToken = existingConfig?.mercadopagoAccessToken || "";
    }

    // Buscar o crear configuración
    const existingConfig = await prisma.systemConfig.findFirst();

    if (existingConfig) {
      await prisma.systemConfig.update({
        where: { id: existingConfig.id },
        data: {
          mercadopagoPublicKey,
          mercadopagoAccessToken: encryptedAccessToken,
          mercadopagoMode
        }
      });
    } else {
      await prisma.systemConfig.create({
        data: {
          mercadopagoPublicKey,
          mercadopagoAccessToken: encryptedAccessToken,
          mercadopagoMode
        }
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Configuración de MercadoPago guardada'
    });

  } catch (error) {
    console.error('Error saving MercadoPago config:', error);
    return NextResponse.json({ error: 'Error al guardar configuración' }, { status: 500 });
  }
}
