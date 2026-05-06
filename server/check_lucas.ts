import { PrismaClient } from './src/generated/client/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { email: 'lucas@gmail.com' } });
  console.log('User:', user);
  if (user) {
    const apps = await prisma.appointment.findMany({ where: { clientId: user.id } });
    console.log('Appointments:', apps);
  } else {
    // try to find by some other email just in case
    const allUsers = await prisma.user.findMany();
    console.log('All user emails:', allUsers.map(u => u.email));
  }
}
main().catch(console.error).finally(()=>prisma.$disconnect());
