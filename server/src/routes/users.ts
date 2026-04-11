import { Router } from 'express';
import { PrismaClient, Role } from '../generated/client/client';
import { requireRole, requireAuth } from '../middleware/auth';
import bcrypt from 'bcryptjs';
import { upload } from '../middlewares/upload';

const router = Router();
const prisma = new PrismaClient();

// In index.ts, this router is already mounted under `requireAuth`.

// GET all specialists (public to authenticated users)
router.get('/specialists', async (req, res) => {
    try {
        const specialists = await prisma.user.findMany({
            where: { role: 'SPECIALIST' },
            select: { id: true, name: true, email: true, phone: true, photoUrl: true },
            orderBy: { name: 'asc' },
        });
        res.json(specialists);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching specialists' });
    }
});

// GET admin settings (public to authenticated users)
router.get('/admin-settings', async (req, res) => {
    try {
        const admin = await prisma.user.findFirst({
            where: { role: 'ADMIN' },
            select: { paymentAlias: true, adminPhone: true, depositPercentage: true },
        });
        res.json(admin || { paymentAlias: null, adminPhone: null, depositPercentage: 50 });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching admin settings' });
    }
});

// PUT update own profile
router.put('/profile', requireAuth, async (req, res) => {
    try {
        const userId = req.user!.userId;
        const { name, phone, password, paymentAlias, adminPhone, depositPercentage, reminderTime, remindersActive } = req.body;
        
        const dataToUpdate: any = {};
        if (name) dataToUpdate.name = name;
        if (phone !== undefined) dataToUpdate.phone = phone;
        if (paymentAlias !== undefined) dataToUpdate.paymentAlias = paymentAlias;
        if (adminPhone !== undefined) dataToUpdate.adminPhone = adminPhone;
        if (depositPercentage !== undefined) dataToUpdate.depositPercentage = Number(depositPercentage);
        if (reminderTime !== undefined) dataToUpdate.reminderTime = reminderTime;
        if (remindersActive !== undefined) dataToUpdate.remindersActive = remindersActive;

        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: dataToUpdate,
            select: { id: true, name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true, paymentAlias: true, adminPhone: true, depositPercentage: true, reminderTime: true, remindersActive: true },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating profile' });
    }
});

// POST upload profile photo
router.post('/profile/photo', requireAuth, upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image uploaded' });
        }
        
        const userId = req.user!.userId;
        const photoUrl = `/uploads/${req.file.filename}`;
        
        const user = await prisma.user.update({
            where: { id: userId },
            data: { photoUrl },
            select: { id: true, name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true },
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error uploading photo' });
    }
});

// We add `requireRole('ADMIN')` to ensure only administrators can use these endpoints.

// GET all users (filter by role optional)
router.get('/', requireRole('ADMIN'), async (req, res) => {
    try {
        const { role } = req.query;
        const users = await prisma.user.findMany({
            where: { ...(role && { role: role as Role }) },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
            orderBy: { name: 'asc' },
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

// GET single user
router.get('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.params.id as string },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching user' });
    }
});

// PUT update user (name, email, role)
router.put('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        const { name, email, role } = req.body;

        if (role && !['ADMIN', 'SPECIALIST', 'CLIENT'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }

        const user = await prisma.user.update({
            where: { id: req.params.id as string },
            data: {
                ...(name !== undefined && { name }),
                ...(email !== undefined && { email }),
                ...(role !== undefined && { role }),
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error updating user' });
    }
});

// DELETE user
router.delete('/:id', requireRole('ADMIN'), async (req, res) => {
    try {
        // To safely delete a user, you might need to handle their appointments first
        // For now, straightforward deletion.
        await prisma.user.delete({ where: { id: req.params.id as string } });
        res.json({ message: 'User deleted' });
    } catch (error) {
        // Prisma throws an error if there are foreign key constraints (like appointments)
        res.status(500).json({ error: 'Error deleting user. They may have active appointments.' });
    }
});

export default router;
