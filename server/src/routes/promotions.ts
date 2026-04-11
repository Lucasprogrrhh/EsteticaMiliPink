import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get the central business config
const getBusinessConfig = async () => {
    let config = await prisma.businessConfig.findFirst();
    if (!config) {
        config = await prisma.businessConfig.create({
            data: {
                pointsPerDollar: 1,
                discountRules: JSON.stringify([
                    { id: 1, points: 100, discount: 5, freeService: null },
                    { id: 2, points: 250, discount: 10, freeService: null },
                    { id: 3, points: 500, discount: 20, freeService: null },
                    { id: 4, points: 1000, discount: 100, freeService: 'Servicio a elección' }
                ])
            }
        });
    }
    return config;
};

// GET /api/promotions/config (Public/Auth)
router.get('/config', async (req, res) => {
    try {
        const config = await getBusinessConfig();
        res.json({
            pointsPerDollar: config.pointsPerDollar,
            discountRules: config.discountRules ? JSON.parse(config.discountRules) : []
        });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching config' });
    }
});

// PATCH /api/promotions/config (Admin only)
router.patch('/config', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { pointsPerDollar, discountRules } = req.body;
        const config = await getBusinessConfig();

        const updated = await prisma.businessConfig.update({
            where: { id: config.id },
            data: {
                pointsPerDollar: pointsPerDollar !== undefined ? Number(pointsPerDollar) : config.pointsPerDollar,
                discountRules: discountRules ? JSON.stringify(discountRules) : config.discountRules
            }
        });

        res.json({
            pointsPerDollar: updated.pointsPerDollar,
            discountRules: updated.discountRules ? JSON.parse(updated.discountRules) : []
        });
    } catch (error) {
        res.status(500).json({ error: 'Error updating config' });
    }
});

// GET /api/promotions/ranking (Admin only)
router.get('/ranking', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const users = await prisma.user.findMany({
            where: { role: 'CLIENT' },
            orderBy: { points: 'desc' },
            take: 50, // top 50
            select: {
                id: true,
                name: true,
                email: true,
                points: true
            }
        });

        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching ranking' });
    }
});

// POST /api/promotions/manual-points (Admin only)
router.post('/manual-points', requireAuth, async (req, res) => {
    try {
        const adminUser = req.user;
        if (!adminUser || adminUser.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { userId, amount, description } = req.body;
        
        if (!userId || !amount) {
            return res.status(400).json({ error: 'Faltan datos' });
        }

        const numericAmount = Number(amount);

        const targetUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!targetUser) return res.status(404).json({ error: 'Usuario no encontrado' });

        await prisma.$transaction(async (tx) => {
            const currentPoints = targetUser.points;
            const finalPoints = Math.max(0, currentPoints + numericAmount);
            const actualChanged = finalPoints - currentPoints; // En caso de restar más de lo que tiene

            await tx.user.update({
                where: { id: userId },
                data: { points: finalPoints }
            });

            await tx.pointsTransaction.create({
                data: {
                    userId,
                    amount: Math.abs(actualChanged),
                    type: actualChanged >= 0 ? 'earned' : 'spent',
                    description: description || 'Asignación manual por administrador'
                }
            });
        });

        res.json({ message: 'Puntos actualizados con éxito' });
    } catch (error: any) {
        console.error(error);
        res.status(500).json({ error: 'Error updating points manually' });
    }
});

// GET /api/promotions/history/:userId (Admin only, or same user)
router.get('/history/:userId', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { userId } = req.params;
        
        if (user.role !== 'ADMIN' && user.userId !== userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        const txs = await prisma.pointsTransaction.findMany({
            where: { userId },
            orderBy: { date: 'desc' }
        });

        res.json(txs);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching history' });
    }
});

export default router;
