import { PrismaClient } from './generated/client/client';
const prisma = new PrismaClient();

async function main() {
  const email = 'ADMIN@ESTETICA.COM'; // The user I just created with the browser_subagent
  const updatedUser = await prisma.user.update({
    where: { email },
    data: { role: 'ADMIN' },
  });
  console.log('User upgraded to ADMIN:', updatedUser.email);
}

main().catch(console.error).finally(() => prisma.$disconnect());
