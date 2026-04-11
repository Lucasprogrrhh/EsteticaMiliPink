import cron from 'node-cron';
import { PrismaClient } from '../generated/client/client';

const prisma = new PrismaClient();

export const startReminderCronJob = () => {
  // Ejecución cada minuto para chequear si coincide la hora
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      // Formato HH:mm local
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeString = `${currentHours}:${currentMinutes}`;

      const admins = await prisma.user.findMany({
        where: { role: 'ADMIN', remindersActive: true },
      });

      if (admins.length === 0) return;

      const admin = admins[0];

      if (admin.reminderTime === currentTimeString) {
        console.log(`[Cron] Ejecutando generación de recordatorios a las ${currentTimeString}`);

        // Turnos de 'mañana'
        const tomorrowStart = new Date(now);
        tomorrowStart.setDate(tomorrowStart.getDate() + 1);
        tomorrowStart.setHours(0, 0, 0, 0);

        const tomorrowEnd = new Date(tomorrowStart);
        tomorrowEnd.setHours(23, 59, 59, 999);

        const appointments = await prisma.appointment.findMany({
          where: {
            status: 'CONFIRMED',
            dateTime: {
              gte: tomorrowStart,
              lte: tomorrowEnd,
            },
          },
          include: {
            client: true,
            specialist: true,
            service: true,
          },
        });

        for (const appt of appointments) {
          const timeFormat = `${appt.dateTime.getHours().toString().padStart(2, '0')}:${appt.dateTime.getMinutes().toString().padStart(2, '0')}`;
          const dateFormat = appt.dateTime.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });

          // Client reminder
          if (appt.client && appt.client.phone) {
            const clientMsg = `Hola ${appt.client.name}, te recordamos que tienes un turno para ${appt.service.name} mañana ${dateFormat} a las ${timeFormat}.\nPor favor, confirmanos tu asistencia. ¡Gracias!`;

            await prisma.reminder.create({
              data: {
                appointmentId: appt.id,
                type: 'CLIENT_REMINDER',
                status: 'PENDING',
                message: clientMsg,
                phoneTarget: appt.client.phone,
                adminId: admin.id,
              },
            });
          }

          // Specialist reminder
          if (appt.specialist && appt.specialist.phone) {
            const specMsg = `Hola ${appt.specialist.name}, te recordamos que mañana tienes un turno de ${appt.service.name} a las ${timeFormat} con el cliente ${appt.client.name}.`;

            await prisma.reminder.create({
              data: {
                appointmentId: appt.id,
                type: 'SPECIALIST_REMINDER',
                status: 'PENDING',
                message: specMsg,
                phoneTarget: appt.specialist.phone,
                adminId: admin.id,
              },
            });
          }
        }
      }
    } catch (error) {
      console.error('[Cron] Error generando recordatorios:', error);
    }
  });
};
