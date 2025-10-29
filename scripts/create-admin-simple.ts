import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    console.log('🔄 Verificando si ya existe el usuario administrador...');

    // Verificar si ya existe
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@time4swim.com' }
    });

    if (existingAdmin) {
      console.log('ℹ️ El usuario administrador ya existe');
      console.log('📧 Email: admin@time4swim.com');
      console.log('🔑 Contraseña: admin123');
      return;
    }

    console.log('👤 Creando usuario administrador...');

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash('admin123', 10);

    // Crear usuario administrador
    const admin = await prisma.user.create({
      data: {
        name: 'Administrador',
        email: 'admin@time4swim.com',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });

    console.log('✅ Usuario administrador creado exitosamente!');
    console.log('📋 Datos de acceso:');
    console.log('   Nombre: Administrador');
    console.log('   Email: admin@time4swim.com');
    console.log('   Contraseña: admin123');
    console.log('   Rol: ADMIN');
    
  } catch (error) {
    console.error('❌ Error al crear el administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();