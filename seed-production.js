const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProduction() {
  try {
    console.log('🚀 Iniciando seed de datos en producción...\n');

    // 1. SEED DE ESTILOS DE NATACIÓN
    console.log('🏊 Insertando estilos de natación...');
    
    const styles = [
      {
        style: 'FREESTYLE',
        nameEs: 'Libre',
        nameEn: 'Freestyle',
        description: 'Estilo libre o crol',
        isActive: true
      },
      {
        style: 'BACKSTROKE',
        nameEs: 'Espalda',
        nameEn: 'Backstroke',
        description: 'Estilo espalda',
        isActive: true
      },
      {
        style: 'BREASTSTROKE',
        nameEs: 'Pecho',
        nameEn: 'Breaststroke',
        description: 'Estilo pecho o braza',
        isActive: true
      },
      {
        style: 'BUTTERFLY',
        nameEs: 'Mariposa',
        nameEn: 'Butterfly',
        description: 'Estilo mariposa',
        isActive: true
      },
      {
        style: 'MEDLEY_RELAY',
        nameEs: '4 Estilos',
        nameEn: 'Individual Medley',
        description: 'Combinado individual (mariposa, espalda, pecho, libre)',
        isActive: true
      }
    ];

    // Eliminar estilos existentes
    await prisma.swimStyleConfig.deleteMany({});
    console.log('✅ Limpieza de estilos existentes completada');

    // Insertar estilos
    for (const style of styles) {
      await prisma.swimStyleConfig.create({
        data: style
      });
      console.log(`   ✅ ${style.nameEs} (${style.style})`);
    }

    const styleCount = await prisma.swimStyleConfig.count();
    console.log(`📊 Total de estilos: ${styleCount}\n`);

    // 2. SEED DE TIPOS DE PISCINA
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

    // Eliminar tipos existentes
    await prisma.poolTypeConfig.deleteMany({});
    console.log('✅ Limpieza de tipos de piscina existentes completada');

    // Insertar tipos de piscina
    for (const poolType of poolTypes) {
      await prisma.poolTypeConfig.create({
        data: poolType
      });
      console.log(`   ✅ ${poolType.nameEs} (${poolType.poolSize})`);
    }

    const poolCount = await prisma.poolTypeConfig.count();
    console.log(`📊 Total de tipos de piscina: ${poolCount}\n`);

    console.log('✅ ¡Seed de producción completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seedProduction();
