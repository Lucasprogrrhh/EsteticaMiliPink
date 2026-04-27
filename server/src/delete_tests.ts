import { PrismaClient } from './generated/client/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Deleting test reviews...');
    // The test review has text: "¡Excelente servicio! Esta es una prueba de backend."
    // We will just delete it by matching part of the text or by author name "Test Reviewer"
    const deletedReviews = await prisma.review.deleteMany({
        where: {
            OR: [
                { comment: { contains: 'prueba' } },
                { comment: { contains: 'Test' } }
            ]
        }
    });
    console.log(`Deleted ${deletedReviews.count} reviews.`);

    console.log('Deleting test specialists directly...');
    await prisma.$executeRaw`DELETE FROM "Appointment" WHERE "specialistId" IN (SELECT "id" FROM "User" WHERE "role" = 'SPECIALIST' AND "name" NOT LIKE '%Milagros%');`;
    await prisma.$executeRaw`DELETE FROM "Appointment" WHERE "clientId" IN (SELECT "id" FROM "User" WHERE "role" = 'SPECIALIST' AND "name" NOT LIKE '%Milagros%');`;
    const result = await prisma.$executeRaw`DELETE FROM "User" WHERE "role" = 'SPECIALIST' AND "name" NOT LIKE '%Milagros%';`;
    console.log(`Deleted specialists.`);
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
