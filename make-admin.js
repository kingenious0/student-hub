const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = process.argv[2];
    if (!email) {
        console.error("Please provide an email address. Example: node make-admin.js test@example.com");
        process.exit(1);
    }

    const user = await prisma.user.findFirst({
        where: { email: email.toLowerCase().trim() }
    });

    if (!user) {
        console.error(`User with email "${email}" not found in the database. Make sure they have signed up first.`);
        process.exit(1);
    }

    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'GOD_MODE' }
    });

    console.log(`Successfully promoted ${updatedUser.name} (${updatedUser.email}) to GOD_MODE!`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
