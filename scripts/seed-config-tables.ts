import { PrismaClient, SwimStyle, PoolSize } from '@prisma/client';

const prisma = new PrismaClient();

async function seedConfigTables() {
  console.log('🌱 Seeding configuration tables...');

  try {
    // Seed SwimStyleConfig
    console.log('\n📝 Seeding SwimStyleConfig...');
    const styles = [
      { style: SwimStyle.FREESTYLE, nameEs: 'Libre', nameEn: 'Freestyle' },
      { style: SwimStyle.BACKSTROKE, nameEs: 'Espalda', nameEn: 'Backstroke' },
      { style: SwimStyle.BREASTSTROKE, nameEs: 'Pecho', nameEn: 'Breaststroke' },
      { style: SwimStyle.BUTTERFLY, nameEs: 'Mariposa', nameEn: 'Butterfly' },
      { style: SwimStyle.INDIVIDUAL_MEDLEY, nameEs: 'Medley Individual', nameEn: 'Individual Medley' },
      { style: SwimStyle.MEDLEY_RELAY, nameEs: 'Relevo Medley', nameEn: 'Medley Relay' },
    ];

    for (const styleData of styles) {
      const existing = await prisma.swimStyleConfig.findUnique({
        where: { style: styleData.style }
      });

      if (!existing) {
        await prisma.swimStyleConfig.create({
          data: { ...styleData, isActive: true }
        });
        console.log(`  ✅ Created: ${styleData.nameEs}`);
      } else {
        console.log(`  ⏭️  Already exists: ${styleData.nameEs}`);
      }
    }

    // Seed PoolTypeConfig
    console.log('\n🏊 Seeding PoolTypeConfig...');
    const pools = [
      { poolSize: PoolSize.SHORT_25M, nameEs: 'Piscina Corta 25m', nameEn: 'Short Course 25m' },
      { poolSize: PoolSize.LONG_50M, nameEs: 'Piscina Larga 50m', nameEn: 'Long Course 50m' },
      { poolSize: PoolSize.OPEN_WATER, nameEs: 'Aguas Abiertas', nameEn: 'Open Water' },
    ];

    for (const poolData of pools) {
      const existing = await prisma.poolTypeConfig.findUnique({
        where: { poolSize: poolData.poolSize }
      });

      if (!existing) {
        await prisma.poolTypeConfig.create({
          data: { ...poolData, isActive: true }
        });
        console.log(`  ✅ Created: ${poolData.nameEs}`);
      } else {
        console.log(`  ⏭️  Already exists: ${poolData.nameEs}`);
      }
    }

    console.log('\n✅ Configuration tables seeded successfully!');
  } catch (error) {
    console.error('❌ Error seeding configuration tables:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedConfigTables()
  .then(() => {
    console.log('\n🎉 Seed completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Seed failed:', error);
    process.exit(1);
  });
