const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixPersonalBests() {
  console.log('🔧 Iniciando corrección de mejores tiempos...');

  try {
    // Obtener todos los registros
    const allRecords = await prisma.record.findMany({
      orderBy: [
        { childId: 'asc' },
        { style: 'asc' },
        { distance: 'asc' },
        { poolSize: 'asc' },
        { time: 'asc' }
      ]
    });

    console.log(`📊 Total de registros encontrados: ${allRecords.length}`);

    // Primero, marcar todos como NO mejor tiempo
    await prisma.record.updateMany({
      data: {
        isPersonalBest: false
      }
    });

    console.log('✅ Todos los registros marcados como NO mejor tiempo');

    // Agrupar por childId, style, distance, poolSize
    const groups = {};
    
    for (const record of allRecords) {
      const key = `${record.childId}-${record.style}-${record.distance}-${record.poolSize}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(record);
    }

    console.log(`📦 Grupos encontrados: ${Object.keys(groups).length}`);

    // Para cada grupo, marcar solo el mejor (menor tiempo) como isPersonalBest
    let updatedCount = 0;
    
    for (const [key, records] of Object.entries(groups)) {
      // Ordenar por tiempo (menor primero)
      records.sort((a, b) => a.time - b.time);
      
      // El primer registro es el mejor tiempo
      const bestRecord = records[0];
      
      await prisma.record.update({
        where: { id: bestRecord.id },
        data: { isPersonalBest: true }
      });
      
      updatedCount++;
      
      if (updatedCount % 10 === 0) {
        console.log(`   Procesados ${updatedCount} grupos...`);
      }
    }

    console.log(`✅ Se marcaron ${updatedCount} mejores tiempos correctamente`);
    console.log('🎉 Corrección completada exitosamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPersonalBests();
