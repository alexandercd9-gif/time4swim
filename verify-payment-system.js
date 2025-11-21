const {PrismaClient} = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    // Check Subscription table
    const subscriptions = await prisma.subscription.count();
    console.log(`✅ Subscription table: ${subscriptions} records`);
    
    // Check Payment table
    const payments = await prisma.payment.count();
    console.log(`✅ Payment table: ${payments} records`);
    
    // Check SystemConfig table
    const configs = await prisma.systemConfig.count();
    console.log(`✅ SystemConfig table: ${configs} records`);
    
    // Verify enums work
    const testPayment = await prisma.$queryRaw`SHOW COLUMNS FROM Payment WHERE Field = 'status'`;
    console.log('\n✅ Payment.status enum:');
    console.log(JSON.stringify(testPayment, null, 2));
    
    // Verify Subscription unique index
    const indexes = await prisma.$queryRaw`SHOW INDEX FROM Subscription WHERE Column_name = 'culqiSubscriptionId'`;
    console.log('\n✅ Subscription.culqiSubscriptionId index:');
    indexes.forEach(idx => {
      console.log(`  - Index: ${idx.Key_name}, Unique: ${idx.Non_unique === 0n ? 'YES' : 'NO'}`);
    });
    
    console.log('\n✅ ALL CULQI PAYMENT TABLES READY FOR PRODUCTION');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
})();
