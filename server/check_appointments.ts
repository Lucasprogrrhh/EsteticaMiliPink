import { PrismaClient } from './src/generated/client/client';
const prisma = new PrismaClient();
prisma.appointment.findMany({ include: { client: true } }).then(res => console.log(JSON.stringify(res, null, 2))).catch(console.error).finally(()=>prisma.$disconnect());
