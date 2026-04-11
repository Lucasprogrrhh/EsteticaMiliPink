import { Router } from 'express';
import { PrismaClient, PortfolioItem } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const prisma = new PrismaClient();

// GET /api/portfolio - Obtener portfolio publicado (Público)
router.get('/', async (req, res) => {
    try {
        const category = req.query.category as string | undefined;
        
        const whereClause: any = { status: 'PUBLISHED' };
        if (category && typeof category === 'string' && category !== 'Todos') {
            whereClause.serviceCategory = category;
        }

        const items = await prisma.portfolioItem.findMany({
            where: whereClause,
            orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el portfolio' });
    }
});

// GET /api/portfolio/admin - Obtener todo el portfolio (Admin)
router.get('/admin', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const items = await prisma.portfolioItem.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                client: { select: { name: true } },
            }
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el portfolio (Admin)' });
    }
});

// POST /api/portfolio/client - Subida por cliente (desde Mis Citas)
router.post('/client', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { description, serviceCategory, specialistName } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Es requerida una imagen' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const item = await prisma.portfolioItem.create({
            data: {
                imageUrl,
                serviceCategory: serviceCategory || 'Otros',
                specialistName: specialistName || 'Mili Belleza',
                description,
                status: 'PENDING',
                clientId: user.userId
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// POST /api/portfolio/admin - Subida por admin (publicado directamente)
router.post('/admin', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { description, serviceCategory, specialistName, isFeatured } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Es requerida una imagen' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        const item = await prisma.portfolioItem.create({
            data: {
                imageUrl,
                serviceCategory: serviceCategory || 'Otros',
                specialistName: specialistName || 'Mili Belleza',
                description,
                status: 'PUBLISHED',
                isFeatured: isFeatured === 'true'
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir la imagen (Admin)' });
    }
});

// PATCH /api/portfolio/:id/status - Admin cambia estado (Aprobar/Rechazar)
router.patch('/:id/status', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { status, isFeatured } = req.body;
        const { id } = req.params;

        const dataUpdate: any = {};
        if (status) dataUpdate.status = status;
        if (isFeatured !== undefined) dataUpdate.isFeatured = isFeatured;

        const item = await prisma.portfolioItem.update({
            where: { id },
            data: dataUpdate
        });

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al actualizar el item de portfolio' });
    }
});

// DELETE /api/portfolio/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;

        await prisma.portfolioItem.delete({
            where: { id }
        });

        res.json({ message: 'Eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el item' });
    }
});

export default router;
