const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedSwimStyles() {
  try {
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

    // Eliminar estilos existentes para evitar duplicados
    await prisma.swimStyleConfig.deleteMany({});
    console.log('✅ Limpieza de estilos existentes completada');

    // Insertar los estilos
    for (const style of styles) {
      await prisma.swimStyleConfig.create({
        data: style
      });
      console.log(`   ✅ ${style.nameEs} (${style.style})`);
    }

    console.log('\n✅ Estilos de natación insertados correctamente');
    
    // Verificar
    const count = await prisma.swimStyleConfig.count();
    console.log(`\n📊 Total de estilos en la base de datos: ${count}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

seedSwimStyles();
