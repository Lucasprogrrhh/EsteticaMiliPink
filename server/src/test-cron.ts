import { PrismaClient } from './generated/client/client';
import { startReminderCronJob } from './cron/reminderJob';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing cron job...');
    const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!admin) {
        console.log('No admin found.');
        process.exit(1);
    }

    const testTime = new Date();
    const currentHours = testTime.getHours().toString().padStart(2, '0');
    const currentMinutes = testTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${currentHours}:${currentMinutes}`;
    
    await prisma.user.update({
        where: { id: admin.id },
        data: { reminderTime: timeString, remindersActive: true }
    });
    
    console.log(`Admin reminder config set to ${timeString} and active=true`);

    // Force run cron job script function directly...
    // Actually, instead of waiting for cron, we can test the creation manually or wait 1 min.
    require('./cron/reminderJob').startReminderCronJob();
    console.log('Cron job initialized. Please wait ~1 minute...');
}
main();
