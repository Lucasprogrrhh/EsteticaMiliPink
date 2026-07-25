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
        console.error("GET /appointments error:", error);
        res.status(500).json({ error: 'Error fetching appointments' });
    }
});

// GET available slots for a specific date
router.get('/available-slots', async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'La fecha (date) es requerida.' });
        }

        // Obtener todos los timeSlots activos
        const timeSlots = await prisma.timeSlot.findMany({
            where: { active: true },
            orderBy: { time: 'asc' },
        });

        // Obtener citas activas de ese día
        const startOfDay = new Date(`${date}T00:00:00.000Z`);
        const endOfDay = new Date(`${date}T23:59:59.999Z`);

        const activeAppointments = await prisma.appointment.findMany({
            where: {
                dateTime: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
                status: { in: ['PENDING', 'CONFIRMED'] },
            },
            select: { dateTime: true },
        });

        // Mapear los slots de tiempo y marcar disponibilidad
        const slotsWithAvailability = timeSlots.map(slot => {
            // Construir el dateTime exacto del slot en la fecha elegida
            const slotDateTime = new Date(`${date}T${slot.time}`);
            
            // Verificar si hay alguna cita en el mismo horario
            const isBooked = activeAppointments.some(app => {
                return new Date(app.dateTime).getTime() === slotDateTime.getTime();
            });

            return {
                id: slot.id,
                time: slot.time,
                available: !isBooked,
            };
        });

        res.json(slotsWithAvailability);
    } catch (error) {
        console.error("GET /available-slots error:", error);
        res.status(500).json({ error: 'Error al obtener disponibilidad de horarios' });
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

        // El cliente de la cita es quien hace el request si es CLIENT
        const clientIdToBook = user.role === 'CLIENT' ? user.userId : (req.body.clientId || user.userId);

        const service = await prisma.service.findUnique({ where: { id: serviceId } });
        if (!service) return res.status(404).json({ error: 'Service not found' });

        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { depositPercentage: true }
        });
        
        const depositPercentage = admin?.depositPercentage ?? 50;
        const depositAmount = Number(service.price) * (depositPercentage / 100);

        // Envolvemos verificación y creación en una transacción atómica para prevenir condiciones de carrera
        const appointment = await prisma.$transaction(async (tx) => {
            // Verificar disponibilidad del horario exacto
            const existingAppointment = await tx.appointment.findFirst({
                where: {
                    dateTime: appointmentDate,
                    status: { in: ['PENDING', 'CONFIRMED'] }
                }
            });

            if (existingAppointment) {
                throw new Error('DUPLICATE_BOOKING');
            }

            return await tx.appointment.create({
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
        });

        res.status(201).json(appointment);
    } catch (error: any) {
        if (error.message === 'DUPLICATE_BOOKING' || (error.code === 'P2002')) {
            return res.status(400).json({ error: 'Este turno ya no está disponible, por favor elegí otro horario.' });
        }
        console.error("POST /appointments error:", error);
        res.status(500).json({ error: 'Error al crear la reserva.' });
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

        // Points logic
        if (status === 'COMPLETED' && existing.status !== 'COMPLETED') {
            await prisma.$transaction([
                prisma.user.update({
                    where: { id: appointment.clientId },
                    data: { points: { increment: 100 } }
                }),
                prisma.pointsTransaction.create({
                    data: {
                        amount: 100,
                        type: 'earned',
                        description: `Servicio completado: ${appointment.service.name}`,
                        userId: appointment.clientId,
                        serviceId: appointment.serviceId
                    }
                })
            ]);
        }

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
