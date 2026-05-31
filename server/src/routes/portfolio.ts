import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const prisma = new PrismaClient();

// GET /api/portfolio - Obtener portfolio publicado (Público)
router.get('/', async (req, res) => {
    try {
        const category = req.query.category as string | undefined;
        
        const whereClause: any = { status: 'approved' };
        if (category && typeof category === 'string' && category !== 'Todos') {
            whereClause.serviceCategory = category;
        }

        const items = await prisma.portfolioItem.findMany({
            where: whereClause,
            orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
            include: {
                uploadedBy: { select: { name: true } },
            }
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
            orderBy: [{ createdAt: 'desc' }],
            include: {
                uploadedBy: { select: { name: true } },
            }
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al obtener el portfolio (Admin)' });
    }
});

// POST /api/portfolio/upload - Subir foto (admin o cliente autenticado)
router.post('/upload', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { description, serviceCategory } = req.body;
        
        if (!req.file) {
            return res.status(400).json({ error: 'Es requerida una imagen' });
        }

        // When using Cloudinary storage, req.file.path is the full HTTPS URL
        const imageUrl = req.file.path || `/uploads/${req.file.filename}`;
        
        // Determine role and status based on who uploads
        const isAdmin = user.role === 'ADMIN';
        const role = isAdmin ? 'admin' : 'client';
        const status = isAdmin ? 'approved' : 'pending';

        const item = await prisma.portfolioItem.create({
            data: {
                imageUrl,
                serviceCategory: serviceCategory || 'Otro',
                description,
                status,
                role,
                uploadedById: user.userId,
                ...(isAdmin ? { approvedById: user.userId } : {})
            }
        });

        res.status(201).json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al subir la imagen' });
    }
});

// PATCH /api/portfolio/:id/approve - Aprobar (solo admin)
router.patch('/:id/approve', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;

        const item = await prisma.portfolioItem.update({
            where: { id: id as string },
            data: { 
                status: 'approved',
                approvedById: user.userId
            }
        });

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al aprobar el item' });
    }
});

// PATCH /api/portfolio/:id/reject - Rechazar (solo admin)
router.patch('/:id/reject', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;

        const item = await prisma.portfolioItem.update({
            where: { id: id as string },
            data: { 
                status: 'rejected',
                approvedById: user.userId
            }
        });

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al rechazar el item' });
    }
});

// PATCH /api/portfolio/:id - Editar categoría/descripción (solo admin)
router.patch('/:id', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;
        const { serviceCategory, description } = req.body;

        const updateData: any = {};
        if (serviceCategory !== undefined) updateData.serviceCategory = serviceCategory;
        if (description !== undefined) updateData.description = description;

        const item = await prisma.portfolioItem.update({
            where: { id: id as string },
            data: updateData
        });

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al editar el item' });
    }
});

// DELETE /api/portfolio/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;

        await prisma.portfolioItem.delete({
            where: { id: id as string }
        });

        res.json({ message: 'Eliminado con éxito' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al eliminar el item' });
    }
});

export default router;
