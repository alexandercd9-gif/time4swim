const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedPoolTypes() {
  try {
    console.log('🏊 Insertando tipos de piscina...');

    const poolTypes = [
      {
        poolSize: 'SHORT_25M',
        nameEs: 'Piscina Corta (25m)',
        nameEn: 'Short Course (25m)',
        description: 'Piscina de 25 metros',
        isActive: true
      },
      {
        poolSize: 'LONG_50M',
        nameEs: 'Piscina Olímpica (50m)',
        nameEn: 'Olympic Pool (50m)',
        description: 'Piscina de 50 metros',
        isActive: true
      },
      {
        poolSize: 'OPEN_WATER',
        nameEs: 'Aguas Abiertas',
        nameEn: 'Open Water',
        description: 'Competencias en aguas abiertas (mar, lago, río)',
        isActive: true
      }
    ];

    // Eliminar tipos existentes para evitar duplicados
    await prisma.poolTypeConfig.deleteMany({});
    console.log('✅ Limpieza de tipos de piscina existentes completada');

    // Insertar los tipos de piscina
    for (const poolType of poolTypes) {
      await prisma.poolTypeConfig.create({
        data: poolType
      });
      console.log(`   ✅ ${poolType.nameEs} (${poolType.poolSize})`);
    }

    console.log('\n✅ Tipos de piscina insertados correctamente');
    
    // Verificar
    const count = await prisma.poolTypeConfig.count();
    console.log(`\n📊 Total de tipos de piscina en la base de datos: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedPoolTypes();
