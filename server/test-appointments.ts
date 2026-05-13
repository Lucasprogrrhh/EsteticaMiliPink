import { PrismaClient } from './src/generated/client/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const appointments = await prisma.appointment.findMany({
            include: {
                client: { select: { id: true, name: true, email: true } },
                specialist: { select: { id: true, name: true, email: true } },
                service: true,
                review: true,
            },
            orderBy: { dateTime: 'asc' },
        });
        console.log(JSON.stringify(appointments, null, 2));
    } catch (e) {
        console.error("ERROR FETCHING APPOINTMENTS", e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
