const { PrismaClient } = require('./server/src/generated/client/client');

// Force dotenv parsing to read DIRECT_URL from server/.env
const fs = require('fs');
const dotenvContent = fs.readFileSync('./server/.env', 'utf-8');
dotenvContent.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
        const key = parts[0].trim();
        let val = parts.slice(1).join('=').trim();
        if (val.startsWith('"') && val.endsWith('"')) {
            val = val.substring(1, val.length - 1);
        }
        process.env[key] = val;
    }
});

const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DIRECT_URL
        }
    }
});

async function check() {
    try {
        const userCount = await prisma.user.count();
        const appointmentCount = await prisma.appointment.count();
        const users = await prisma.user.findMany({
            select: { email: true, role: true, name: true }
        });
        console.log("=== DB CHECK ===");
        console.log(`Total Usuarios: ${userCount}`);
        console.log(`Total Turnos: ${appointmentCount}`);
        console.log("Lista de Usuarios en DB:");
        console.dir(users);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
