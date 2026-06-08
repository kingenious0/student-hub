const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding coupons...');
  const coupons = [
    {
      code: 'WELCOME10',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      maxUses: 100,
      expiryDate: new Date('2030-12-31T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'SAVE5',
      discountType: 'FIXED',
      discountValue: 5,
      maxUses: 100,
      expiryDate: new Date('2030-12-31T23:59:59Z'),
      isActive: true,
    },
    {
      code: 'EXPIRED50',
      discountType: 'PERCENTAGE',
      discountValue: 50,
      maxUses: 10,
      expiryDate: new Date('2024-12-31T23:59:59Z'),
      isActive: true,
    }
  ];

  for (const coupon of coupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    });
    console.log(`✅ Coupon ${coupon.code} seeded!`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
