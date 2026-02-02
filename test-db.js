
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany({ take: 1 });
    console.log('SUCCESS: Connected to DB. Found', users.length, 'users.');
  } catch (err) {
    console.error('FAILURE: Could not connect to DB:', err.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
