import { PrismaClient, pooltypeconfig_poolSize, swimstyleconfig_style } from '@prisma/client';

const prisma = new PrismaClient();

async function seedConfigTables() {
  console.log('🌱 Seeding configuration tables...');

  try {
    // Seed SwimStyleConfig
    console.log('\n📝 Seeding SwimStyleConfig...');
    const styles = [
      { style: swimstyleconfig_style.FREESTYLE, nameEs: 'Libre', nameEn: 'Freestyle' },
      { style: swimstyleconfig_style.BACKSTROKE, nameEs: 'Espalda', nameEn: 'Backstroke' },
      { style: swimstyleconfig_style.BREASTSTROKE, nameEs: 'Pecho', nameEn: 'Breaststroke' },
      { style: swimstyleconfig_style.BUTTERFLY, nameEs: 'Mariposa', nameEn: 'Butterfly' },
      { style: swimstyleconfig_style.INDIVIDUAL_MEDLEY, nameEs: 'Medley Individual', nameEn: 'Individual Medley' },
      { style: swimstyleconfig_style.MEDLEY_RELAY, nameEs: 'Relevo Medley', nameEn: 'Medley Relay' },
    ];

    for (const styleData of styles) {
      const existing = await prisma.swimstyleconfig.findUnique({
        where: { style: styleData.style }
      });

      if (!existing) {
        await prisma.swimstyleconfig.create({
          data: {
            id: styleData.style,
            ...styleData,
            isActive: true,
            updatedAt: new Date()
          }
        });
        console.log(`  ✅ Created: ${styleData.nameEs}`);
      } else {
        console.log(`  ⏭️  Already exists: ${styleData.nameEs}`);
      }
    }

    // Seed PoolTypeConfig
    console.log('\n🏊 Seeding PoolTypeConfig...');
    const pools = [
      { poolSize: pooltypeconfig_poolSize.SHORT_25M, nameEs: 'Piscina Corta 25m', nameEn: 'Short Course 25m' },
      { poolSize: pooltypeconfig_poolSize.LONG_50M, nameEs: 'Piscina Larga 50m', nameEn: 'Long Course 50m' },
      { poolSize: pooltypeconfig_poolSize.OPEN_WATER, nameEs: 'Aguas Abiertas', nameEn: 'Open Water' },
    ];

    for (const poolData of pools) {
      const existing = await prisma.pooltypeconfig.findUnique({
        where: { poolSize: poolData.poolSize }
      });

      if (!existing) {
        await prisma.pooltypeconfig.create({
          data: {
            id: poolData.poolSize,
            ...poolData,
            isActive: true,
            updatedAt: new Date()
          }
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
