import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';
import { upload } from '../middlewares/upload';

const router = Router();
const prisma = new PrismaClient();

// POST /api/reviews - Crear una reseña nueva
router.post('/', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { appointmentId, comment } = req.body;
        const rating = parseInt(req.body.rating, 10);

        if (!appointmentId || isNaN(rating) || rating < 1 || rating > 5) {
            return res.status(400).json({ error: 'Valid appointmentId and rating (1-5) are required' });
        }

        const photoUrl = req.file ? `/uploads/${req.file.filename}` : null;

        // Validate appointment belongs to user and is COMPLETED
        const appointment = await prisma.appointment.findUnique({
            where: { id: appointmentId },
            include: { review: true }
        });

        if (!appointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }

        // Validar que el cliente de la cita sea el usuario logueado
        if (appointment.clientId !== user.userId && user.role !== 'ADMIN') { // Permitiendo admins por si acaso
            return res.status(403).json({ error: 'Forbidden' });
        }

        if (appointment.status !== 'COMPLETED') {
            return res.status(400).json({ error: 'Solo puedes calificar citas con estado COMPLETED' });
        }

        if (appointment.review) {
            return res.status(400).json({ error: 'Esta cita ya ha sido calificada' });
        }

        const review = await prisma.review.create({
            data: {
                rating,
                comment,
                photoUrl,
                appointmentId,
                clientId: appointment.clientId,
                serviceId: appointment.serviceId
            },
            include: {
                client: { select: { id: true, name: true } },
                service: { select: { id: true, name: true } }
            }
        });

        res.status(201).json(review);
    } catch (error: any) {
        console.error(error);
        if (error.code === 'P2002') { // Prisma unique constraint violation
            return res.status(400).json({ error: 'Esta cita ya ha sido calificada.' });
        }
        res.status(500).json({ error: 'Error creating review' });
    }
});

// GET /api/reviews - Obtener reseñas (Listado público para carrusel)
router.get('/', async (req, res) => {
    try {
        const { limit = 10 } = req.query; // Para mostrar en el carrusel
        const maxLimit = Math.min(parseInt(limit as string) || 10, 50);

        const reviews = await prisma.review.findMany({
            take: maxLimit,
            orderBy: { createdAt: 'desc' },
            include: {
                client: { select: { id: true, name: true } },
                service: { select: { id: true, name: true } }
            }
        });

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching reviews' });
    }
});

export default router;
