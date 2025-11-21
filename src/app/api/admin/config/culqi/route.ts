import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || "32-character-secret-key-here!!"; // 32 caracteres
const ENCRYPTION_IV_LENGTH = 16;

// Función para cifrar
function encrypt(text: string): string {
  const iv = crypto.randomBytes(ENCRYPTION_IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Función para descifrar
function decrypt(text: string): string {
  const parts = text.split(':');
  const iv = Buffer.from(parts.shift()!, 'hex');
  const encryptedText = Buffer.from(parts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32)),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

/**
 * GET /api/admin/config/culqi
 * Obtiene la configuración de Culqi (solo para admins)
 */
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

    // Buscar configuración
    const config = await prisma.systemConfig.findFirst({
      where: { key: 'culqi_credentials' }
    });

    if (!config || !config.value) {
      return NextResponse.json({
        culqiPublicKey: "",
        culqiSecretKey: "",
        culqiMode: "test"
      });
    }

    // Descifrar y devolver (con secret key parcialmente oculta)
    const decrypted = JSON.parse(decrypt(config.value));
    
    return NextResponse.json({
      culqiPublicKey: decrypted.culqiPublicKey || "",
      culqiSecretKey: decrypted.culqiSecretKey ? 
        decrypted.culqiSecretKey.substring(0, 10) + '**********************' : "",
      culqiMode: decrypted.culqiMode || "test"
    });

  } catch (err) {
    console.error("GET /api/admin/config/culqi error:", err);
    return NextResponse.json(
      { error: "Error al obtener configuración" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/config/culqi
 * Guarda la configuración de Culqi (cifrada)
 */
export async function POST(request: Request) {
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

    // Obtener datos del body
    const body = await request.json();
    const { culqiPublicKey, culqiSecretKey, culqiMode } = body;

    if (!culqiPublicKey || !culqiSecretKey) {
      return NextResponse.json(
        { error: "Public Key y Secret Key son requeridas" },
        { status: 400 }
      );
    }

    // Cifrar credenciales
    const encrypted = encrypt(JSON.stringify({
      culqiPublicKey,
      culqiSecretKey,
      culqiMode: culqiMode || "test"
    }));

    // Guardar o actualizar en base de datos
    await prisma.systemConfig.upsert({
      where: { key: 'culqi_credentials' },
      update: {
        value: encrypted,
        updatedAt: new Date()
      },
      create: {
        key: 'culqi_credentials',
        value: encrypted
      }
    });

    return NextResponse.json({
      success: true,
      message: "Configuración guardada exitosamente"
    });

  } catch (err) {
    console.error("POST /api/admin/config/culqi error:", err);
    return NextResponse.json(
      { error: "Error al guardar configuración" },
      { status: 500 }
    );
  }
}
