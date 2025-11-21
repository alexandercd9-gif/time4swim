/**
 * Cambiar contraseña para admin@time4swim.com
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    const email = 'admin@time4swim.com';
    const newPassword = 'admin123';

    console.log(`\n🔍 Buscando usuario: ${email}...\n`);

    // Buscar el usuario
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      console.log(`❌ No se encontró el usuario ${email}`);
      console.log('\n💡 Verifica que el email sea correcto');
      return;
    }

    console.log(`✅ Usuario encontrado:`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Nombre: ${user.name || 'N/A'}`);
    console.log(`   Rol: ${user.role}`);

    // Hash de la nueva contraseña
    console.log(`\n🔐 Generando hash para la nueva contraseña...`);
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    console.log(`\n✅ Contraseña actualizada exitosamente!`);
    console.log(`\n📋 Credenciales:`);
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: ${newPassword}`);
    console.log(`\n🎯 Ahora puedes iniciar sesión con estas credenciales`);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
