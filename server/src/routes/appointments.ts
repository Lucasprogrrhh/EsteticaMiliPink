import { Router } from 'express';
import { PrismaClient, AppointmentStatus } from '../generated/client/client';

const router = Router();
const prisma = new PrismaClient();

// GET all appointments
router.get('/', async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { specialistId, status } = req.query;

        // Si es CLIENTE, forzamos que solo vea sus citas.
        const clientId = user.role === 'CLIENT' ? user.userId : req.query.clientId;

        const appointments = await prisma.appointment.findMany({
            where: {
                ...(clientId && { clientId: String(clientId) }),
                ...(specialistId && { specialistId: String(specialistId) }),
                ...(status && { status: status as AppointmentStatus }),
            },
            include: {
                client: { select: { id: true, name: true, email: true } },
                specialist: { select: { id: true, name: true, email: true } },
                service: true,
                review: true,
            },
            orderBy: { dateTime: 'asc' },
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching appointments' });
    }
});

// GET single appointment
router.get('/:id', async (req, res) => {
    try {
        const user = req.user;
        const appointment = await prisma.appointment.findUnique({
            where: { id: req.params.id },
            include: {
                client: { select: { id: true, name: true, email: true } },
                specialist: { select: { id: true, name: true, email: true } },
                service: true,
                review: true,
            },
        });
        if (!appointment) return res.status(404).json({ error: 'Appointment not found' });

        // Un cliente no puede ver citas de otros
        if (user?.role === 'CLIENT' && appointment.clientId !== user.userId) {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching appointment' });
    }
});

// POST create appointment
router.post('/', async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { dateTime, serviceId, specialistId, notes } = req.body;
        if (!dateTime || !serviceId) {
            return res.status(400).json({ error: 'dateTime and serviceId are required' });
        }

        const appointmentDate = new Date(dateTime);
        
        // Prevent booking in the past
        if (appointmentDate < new Date()) {
            return res.status(400).json({ error: 'Cannot book an appointment in the past' });
        }

        // Overlap validation for specialist
        if (specialistId) {
            const existingAppointment = await prisma.appointment.findFirst({
                where: {
                    specialistId,
                    dateTime: appointmentDate,
                    status: { in: ['PENDING', 'CONFIRMED'] }
                }
            });

            if (existingAppointment) {
                return res.status(400).json({ error: 'El especialista ya tiene una cita reservada a esta hora.' });
            }
        }

        // El cliente de la cita es quien hace el request si es CLIENT
        // Un ADMIN podría crear citas para otros (enviando clientId en body), pero lo simplificaremos por ahora
        const clientIdToBook = user.role === 'CLIENT' ? user.userId : (req.body.clientId || user.userId);

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ error: 'Service not found' });

        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { depositPercentage: true }
        });
        
        const depositPercentage = admin?.depositPercentage ?? 50;
        const depositAmount = Number(service.price) * (depositPercentage / 100);

        const appointment = await prisma.appointment.create({
            data: {
                dateTime: appointmentDate,
                clientId: clientIdToBook,
                serviceId,
                depositAmount,
                ...(specialistId && { specialistId }),
                ...(notes && { notes }),
            },
            include: {
                client: { select: { id: true, name: true, email: true } },
                service: true,
            },
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Error creating appointment' });
    }
});

// PATCH update appointment status (e.g. Cancel)
router.patch('/:id/status', async (req, res) => {
    try {
        const user = req.user;
        if (!user) return res.status(401).json({ error: 'Unauthorized' });

        const { status } = req.body;
        const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = await prisma.appointment.findUnique({ where: { id: req.params.id } });
        if (!existing) return res.status(404).json({ error: 'Appointment not found' });

        // Solo el cliente dueño de la cita o un ADMIN pueden cancelar
        if (user.role === 'CLIENT') {
            if (existing.clientId !== user.userId) {
                return res.status(403).json({ error: 'Forbidden. You can only update your own appointments.' });
            }
            if (status !== 'CANCELLED') {
                return res.status(403).json({ error: 'Forbidden. Clients can only cancel appointments.' });
            }
        }

        const appointment = await prisma.appointment.update({
            where: { id: req.params.id },
            data: { 
                status,
                ...(req.body.notes && { notes: req.body.notes })
            },
            include: {
                service: true,
                client: { select: { id: true, name: true, email: true, phone: true } }
            }
        });
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Error updating appointment status' });
    }
});

// DELETE appointment (ADMIN only)
router.delete('/:id', async (req, res) => {
    try {
        const user = req.user;
        if (user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden. Only administrators can delete appointments.' });
        }
        await prisma.appointment.delete({ where: { id: req.params.id } });
        res.json({ message: 'Appointment deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting appointment' });
    }
});

export default router;
