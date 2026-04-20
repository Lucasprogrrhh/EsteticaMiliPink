import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const prisma = new PrismaClient();

// GET /api/courses - Obtener cursos activos públicos
router.get('/', async (req, res) => {
    try {
        const courses = await prisma.course.findMany({
            where: { status: 'ACTIVE' },
            orderBy: { createdAt: 'desc' }
        });
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching courses' });
    }
});

// GET /api/courses/admin - Obtener todos (Admin)
router.get('/admin', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const courses = await prisma.course.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(courses);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error fetching courses for admin' });
    }
});

// POST /api/courses - Crear curso
router.post('/', requireAuth, upload.single('coverImage'), async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { name, category, description, contentGuide, duration, price, maxSpots, status } = req.body;

        let coverImageUrl = undefined;
        if (req.file) {
            coverImageUrl = `/uploads/${req.file.filename}`;
        }

        const course = await prisma.course.create({
            data: {
                name,
                category: category || 'General',
                description,
                contentGuide,
                duration,
                price: parseFloat(price) || 0,
                maxSpots: parseInt(maxSpots) || 10,
                status: status || 'ACTIVE',
                coverImageUrl
            }
        });

        res.status(201).json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error creating course' });
    }
});

// PATCH /api/courses/:id - Editar curso/Toggle visibility
router.patch('/:id', requireAuth, upload.single('coverImage'), async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });

        const { id } = req.params;
        const { name, category, description, contentGuide, duration, price, maxSpots, status } = req.body;

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (category !== undefined) data.category = category;
        if (description !== undefined) data.description = description;
        if (contentGuide !== undefined) data.contentGuide = contentGuide;
        if (duration !== undefined) data.duration = duration;
        if (price !== undefined) data.price = parseFloat(price);
        if (maxSpots !== undefined) data.maxSpots = parseInt(maxSpots);
        if (status !== undefined) data.status = status;

        if (req.file) {
            data.coverImageUrl = `/uploads/${req.file.filename}`;
        }

        const course = await prisma.course.update({
            where: { id },
            data
        });

        res.json(course);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error updating course' });
    }
});

// DELETE /api/courses/:id
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        const user = req.user;
        if (!user || user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
        
        await prisma.course.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error deleting course' });
    }
});

export default router;
