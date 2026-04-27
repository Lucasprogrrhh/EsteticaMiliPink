import { Router } from 'express';
import { PrismaClient } from '../generated/client/client';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all services (active only for clients)
router.get('/', async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        const services = await prisma.service.findMany({
            where: { active: true },
            orderBy: { name: 'asc' },
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching services' });
    }
});

// GET all services for admin (including inactive)
router.get('/all', requireAuth, async (req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden.' });
        
        const services = await prisma.service.findMany({
            orderBy: { name: 'asc' },
        });
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching all services' });
    }
});

// GET single service
router.get('/:id', async (req, res) => {
    try {
        const service = await prisma.service.findUnique({
            where: { id: req.params.id },
        });
        if (!service) return res.status(404).json({ error: 'Service not found' });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching service' });
    }
});

// POST create service
router.post('/', requireAuth, async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden. Solo administradores pueden crear servicios.' });
        
        const { name, description, price, durationMinutes } = req.body;
        if (!name || price === undefined || !durationMinutes) {
            return res.status(400).json({ error: 'name, price and durationMinutes are required' });
        }
        const service = await prisma.service.create({
            data: { name, description, price: parseFloat(price), durationMinutes: parseInt(durationMinutes) },
        });
        res.status(201).json(service);
    } catch (error) {
        res.status(500).json({ error: 'Error creating service' });
    }
});

// PUT update service
router.put('/:id', requireAuth, async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden. Solo administradores pueden editar servicios.' });

        const { name, description, price, durationMinutes, active } = req.body;
        const service = await prisma.service.update({
            where: { id: String(req.params.id) },
            data: {
                ...(name !== undefined && { name }),
                ...(description !== undefined && { description }),
                ...(price !== undefined && { price: parseFloat(price) }),
                ...(durationMinutes !== undefined && { durationMinutes: parseInt(durationMinutes) }),
                ...(active !== undefined && { active }),
            },
        });
        res.json(service);
    } catch (error) {
        res.status(500).json({ error: 'Error updating service' });
    }
});

// DELETE (soft delete) service
router.delete('/:id', requireAuth, async (req, res) => {
    try {
        if (req.user?.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden. Solo administradores pueden eliminar servicios.' });

        await prisma.service.update({
            where: { id: String(req.params.id) },
            data: { active: false },
        });
        res.json({ message: 'Service deactivated' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting service' });
    }
});

export default router;
