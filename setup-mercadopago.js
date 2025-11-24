const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

const prisma = new PrismaClient();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'time4swim-encryption-key-32chars';
const ALGORITHM = 'aes-256-cbc';

// Función para cifrar
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

async function setupMercadoPago() {
  try {
    console.log('🔧 Configurando MercadoPago en la base de datos...\n');

    // Credenciales de TEST
    const publicKey = 'TEST-3ed3536f-d275-40eb-bd29-05f34f6aad5b';
    const accessToken = 'TEST-6901147916800198-112122-4527947dd6abc9783138bbbd9fc9a447-3008944266';

    // Cifrar el Access Token
    const encryptedToken = encrypt(accessToken);

    // Buscar configuración existente
    const existingConfig = await prisma.systemConfig.findFirst();

    if (existingConfig) {
      // Actualizar configuración existente
      await prisma.systemConfig.update({
        where: { id: existingConfig.id },
        data: {
          mercadopagoPublicKey: publicKey,
          mercadopagoAccessToken: encryptedToken,
          mercadopagoMode: 'test'
        }
      });
      console.log('✅ Configuración de MercadoPago actualizada');
    } else {
      // Crear nueva configuración
      await prisma.systemConfig.create({
        data: {
          activePaymentProcessor: 'culqi', // Por defecto Culqi
          mercadopagoPublicKey: publicKey,
          mercadopagoAccessToken: encryptedToken,
          mercadopagoMode: 'test'
        }
      });
      console.log('✅ Configuración de MercadoPago creada');
    }

    // Verificar
    const config = await prisma.systemConfig.findFirst();
    console.log('\n📊 Estado de la configuración:');
    console.log('   - Procesador activo:', config.activePaymentProcessor);
    console.log('   - MercadoPago Public Key:', config.mercadopagoPublicKey);
    console.log('   - MercadoPago Modo:', config.mercadopagoMode);
    console.log('   - Access Token cifrado:', config.mercadopagoAccessToken ? '✅ Configurado' : '❌ No configurado');

    console.log('\n✨ ¡Listo! Ahora puedes:');
    console.log('   1. Ir a http://localhost:3000/admin/configuracion');
    console.log('   2. Ver la pestaña "Procesador de Pago"');
    console.log('   3. Cambiar entre Culqi y MercadoPago');
    console.log('   4. Ver las credenciales en la pestaña "MercadoPago"');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

setupMercadoPago();
