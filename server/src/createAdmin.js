const { PrismaClient } = require('../generated/client/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();
async function main() {
  const hashedPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@estetica.com' },
    update: { password: hashedPassword, role: 'ADMIN' },
    create: { email: 'admin@estetica.com', name: 'Admin', password: hashedPassword, role: 'ADMIN' }
  });
  console.log('Admin user ready');
  process.exit(0);
}
main();
