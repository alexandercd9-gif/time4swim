const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestParent() {
  try {
    // Crear usuario padre con trial de 30 días
    const hashedPassword = await bcrypt.hash('test123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'Test Padre',
        email: `testpadre${Date.now()}@test.com`,
        password: hashedPassword,
        role: 'PARENT',
        accountStatus: 'TRIAL',
        isTrialAccount: true,
        trialExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // +30 días
      }
    });

    console.log('✅ Usuario trial creado:');
    console.log(`   Email: ${user.email}`);
    console.log(`   ID: ${user.id}`);
    console.log(`   Password: test123`);
    console.log(`   Trial expira: ${user.trialExpiresAt}`);
    console.log('\n📌 Para convertir a permanente:');
    console.log(`   1. Ve a http://localhost:3000/admin/usuarios`);
    console.log(`   2. Busca el usuario: ${user.email}`);
    console.log(`   3. Haz clic en "Hacer Permanente"`);
    console.log(`   4. Se creará automáticamente su suscripción PARENT_BASIC`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestParent();
