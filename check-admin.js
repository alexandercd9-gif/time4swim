const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const admin = await prisma.user.findUnique({
      where: { email: 'admin@time4swim.com' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
      }
    });
    
    console.log('✅ Admin user exists:');
    console.log(JSON.stringify(admin, null, 2));
    
    // Count all users
    const count = await prisma.user.count();
    console.log(`\nTotal users in database: ${count}`);
    
    // List all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        accountStatus: true,
      }
    });
    
    console.log('\nAll users:');
    users.forEach(u => console.log(`- ${u.email} (${u.role}) - ${u.accountStatus}`));
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
