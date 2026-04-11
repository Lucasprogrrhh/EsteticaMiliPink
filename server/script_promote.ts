import { PrismaClient } from './src/generated/client/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin_test_1@estetica.com';
    try {
        const user = await prisma.user.update({
            where: { email },
            data: { role: 'ADMIN' }
        });
        console.log(`Promoted user ${email} to ADMIN successfully:`, user.id);
    } catch (err) {
        console.error(`Failed to promote ${email}. They might not exist yet.`);
    } finally {
        await prisma.$disconnect();
    }
}

main();
