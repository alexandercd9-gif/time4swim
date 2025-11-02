const { PrismaClient } = require('@prisma/client');

(async () => {
  const prisma = new PrismaClient();
  try {
    const styles = await prisma.swimStyleConfig.count();
    const pools = await prisma.poolTypeConfig.count();
    console.log(`styles=${styles}, pools=${pools}`);
  } catch (e) {
    console.error('error', e);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
