import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET /api/time-slots - Obtener todos los horarios (público)
router.get('/', async (req: Request, res: Response): Promise<void> => {
    try {
        const timeSlots = await prisma.timeSlot.findMany({
            orderBy: { time: 'asc' },
        });
        res.json(timeSlots);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener horarios' });
    }
});

// POST /api/time-slots - Crear un nuevo horario (solo admin)
router.post('/', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { time } = req.body;
        if (!time) {
            res.status(400).json({ error: 'El horario es requerido.' });
            return;
        }

        const existing = await prisma.timeSlot.findUnique({ where: { time } });
        if (existing) {
            res.status(400).json({ error: 'Este horario ya existe.' });
            return;
        }

        const newSlot = await prisma.timeSlot.create({
            data: { time, active: true },
        });
        res.status(201).json(newSlot);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al crear horario' });
    }
});

// PATCH /api/time-slots/:id - Actualizar un horario (solo admin)
router.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        const { active, time } = req.body;

        const updated = await prisma.timeSlot.update({
            where: { id },
            data: { active, time },
        });
        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar horario' });
    }
});

// DELETE /api/time-slots/:id - Eliminar un horario (solo admin)
router.delete('/:id', requireAuth, requireAdmin, async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;
        await prisma.timeSlot.delete({ where: { id } });
        res.json({ success: true });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar horario' });
    }
});

export default router;
