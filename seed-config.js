const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function seedStylesAndPools() {
  try {
    console.log('🏊 Poblando tabla de estilos de natación...\n');

    // Datos de estilos
    const styles = [
      {
        style: 'FREESTYLE',
        nameEs: 'Libre',
        nameEn: 'Freestyle',
        description: 'Estilo libre, principalmente crol'
      },
      {
        style: 'BACKSTROKE',
        nameEs: 'Espalda',
        nameEn: 'Backstroke',
        description: 'Nado de espalda'
      },
      {
        style: 'BREASTSTROKE',
        nameEs: 'Pecho',
        nameEn: 'Breaststroke',
        description: 'Nado de pecho'
      },
      {
        style: 'BUTTERFLY',
        nameEs: 'Mariposa',
        nameEn: 'Butterfly',
        description: 'Nado mariposa'
      },
      {
        style: 'INDIVIDUAL_MEDLEY',
        nameEs: 'Combinado Individual',
        nameEn: 'Individual Medley',
        description: 'Combinación de los cuatro estilos'
      },
      {
        style: 'MEDLEY_RELAY',
        nameEs: 'Relevo Combinado',
        nameEn: 'Medley Relay',
        description: 'Relevo con los cuatro estilos'
      }
    ];

    // Insertar estilos (usar upsert para evitar duplicados)
    for (const style of styles) {
      await prisma.swimStyleConfig.upsert({
        where: { style: style.style },
        update: style,
        create: style
      });
      console.log(`✅ Estilo agregado: ${style.nameEs} (${style.style})`);
    }

    console.log('\n🏊 Poblando tabla de tipos de piscina...\n');

    // Datos de tipos de piscina
    const poolTypes = [
      {
        poolSize: 'SHORT_25M',
        nameEs: 'Piscina 25m',
        nameEn: '25m Pool',
        description: 'Piscina corta de 25 metros'
      },
      {
        poolSize: 'LONG_50M',
        nameEs: 'Piscina 50m',
        nameEn: '50m Pool',
        description: 'Piscina olímpica de 50 metros'
      },
      {
        poolSize: 'OPEN_WATER',
        nameEs: 'Aguas Abiertas',
        nameEn: 'Open Water',
        description: 'Competencias en aguas abiertas (mar, lago, río)'
      }
    ];

    // Insertar tipos de piscina
    for (const poolType of poolTypes) {
      await prisma.poolTypeConfig.upsert({
        where: { poolSize: poolType.poolSize },
        update: poolType,
        create: poolType
      });
      console.log(`✅ Tipo de piscina agregado: ${poolType.nameEs} (${poolType.poolSize})`);
    }

    console.log('\n🎉 ¡Datos iniciales poblados exitosamente!');

    // Mostrar resumen
    const stylesCount = await prisma.swimStyleConfig.count();
    const poolsCount = await prisma.poolTypeConfig.count();
    
    console.log(`\n📊 Resumen:`);
    console.log(`   - Estilos de natación: ${stylesCount}`);
    console.log(`   - Tipos de piscina: ${poolsCount}`);

  } catch (error) {
    console.error('❌ Error poblando datos:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedStylesAndPools();