/**
 * Crear usuario ADMIN para acceso inmediato
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n🔐 Creando usuario ADMIN...\n');

    // Verificar si ya existe
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@time4swim.com' }
    });

    if (existing) {
      console.log('ℹ️  El usuario ya existe, actualizando contraseña...');
      
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      await prisma.user.update({
        where: { email: 'admin@time4swim.com' },
        data: { password: hashedPassword }
      });
      
      console.log('✅ Contraseña actualizada');
    } else {
      // Crear nuevo usuario
      const hashedPassword = await bcrypt.hash('admin123', 10);
      
      const trialExpiresAt = new Date();
      trialExpiresAt.setDate(trialExpiresAt.getDate() + 30);
      
      const user = await prisma.user.create({
        data: {
          email: 'admin@time4swim.com',
          password: hashedPassword,
          name: 'Administrador',
          role: 'ADMIN',
          accountStatus: 'ACTIVE',
          isTrialAccount: false
        }
      });

      console.log('✅ Usuario ADMIN creado exitosamente!');
      console.log(`   ID: ${user.id}`);
    }

    console.log('\n📋 CREDENCIALES:');
    console.log('   Email: admin@time4swim.com');
    console.log('   Contraseña: admin123');
    console.log('   Rol: ADMIN');
    
    console.log('\n🎯 Ahora puedes:');
    console.log('   1. Ir a http://localhost:3000/login');
    console.log('   2. Iniciar sesión con estas credenciales');
    console.log('   3. Acceder al panel de administración');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
