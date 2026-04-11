import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all pending reminders (only for ADMIN)
router.get('/', requireRole('ADMIN'), async (req, res) => {
    try {
        const reminders = await prisma.reminder.findMany({
            where: { status: 'PENDING' },
            include: {
                appointment: {
                    include: {
                        client: true,
                        specialist: true,
                        service: true,
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reminders' });
    }
});

// PATCH mark reminder as sent (only for ADMIN)
router.patch('/:id/sent', requireRole('ADMIN'), async (req, res) => {
    try {
        const reminderId = req.params.id as string;
        const reminder = await prisma.reminder.update({
            where: { id: reminderId },
            data: { status: 'SENT' },
        });
        res.json(reminder);
    } catch (error) {
        res.status(500).json({ error: 'Error updating reminder' });
    }
});

export default router;
