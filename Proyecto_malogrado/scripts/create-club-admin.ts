import { db } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function createClubAdmin() {
  try {
    console.log('🔄 Creando administrador de club de prueba...');

    // Verificar si ya existe
    const existingClubAdmin = await db.findUserByEmail('club@time4swim.com');

    if (existingClubAdmin) {
      console.log('ℹ️ El administrador de club ya existe');
      console.log('📧 Email: club@time4swim.com');
      console.log('🔑 Contraseña: club123');
      return;
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash('club123', 10);

    // Crear usuario administrador de club
    const clubAdmin = await db.createUser({
      fullName: 'Administrador Club',
      email: 'club@time4swim.com',
      password: hashedPassword,
      role: 'TEACHER'
    });

    console.log('✅ Administrador de club creado exitosamente!');
    console.log('📋 Datos de acceso:');
    console.log('   Nombre: Administrador Club');
    console.log('   Email: club@time4swim.com');
    console.log('   Contraseña: club123');
    console.log('   Rol: TEACHER');
    
  } catch (error) {
    console.error('❌ Error creando administrador de club:', error);
  } finally {
    await db.rawClient.$disconnect();
  }
}

createClubAdmin();