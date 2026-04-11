const { PrismaClient } = require('./src/generated/client/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe(`UPDATE User SET role='ADMIN' WHERE email='admin_test_1@estetica.com'`);
    console.log("Updated!");
}
main().finally(() => prisma.$disconnect());
