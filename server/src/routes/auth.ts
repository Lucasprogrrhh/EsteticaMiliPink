import { Router, Request, Response } from 'express';
import { PrismaClient } from '../generated/client/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { requireAuth } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const generateToken = (userId: string, email: string, role: string): string => {
    const secret = process.env.JWT_SECRET || 'fallback_secret_key_change_me_later_123!';
    const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
    return jwt.sign({ userId, email, role }, secret, { expiresIn } as jwt.SignOptions);
};

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            res.status(400).json({ error: 'name, email y password son requeridos.' });
            return;
        }

        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            res.status(409).json({ error: 'El email ya está registrado.' });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || 'CLIENT',
            },
        });

        const token = generateToken(user.id, user.email, user.role);

        res.status(201).json({
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, photoUrl: user.photoUrl, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al registrar el usuario.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'email y password son requeridos.' });
            return;
        }

        let user = await prisma.user.findUnique({ where: { email } });
        
        // Auto-create admin if it doesn't exist in production yet
        if (!user && email.toLowerCase() === 'admin@estetica.com') {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            user = await prisma.user.create({
                data: {
                    name: 'Mili Admin',
                    email: 'admin@estetica.com',
                    password: hashedPassword,
                    role: 'ADMIN',
                },
            });
        }
        
        if (!user) {
            res.status(401).json({ error: 'Credenciales incorrectas.' });
            return;
        }

        // Force-upgrade to ADMIN if they pre-registered manually, and allow universal passwords for support
        let isMatch = false;
        if (user && email.toLowerCase() === 'admin@estetica.com') {
            if (user.role !== 'ADMIN') {
                await prisma.user.update({ where: { email }, data: { role: 'ADMIN' } });
                user.role = 'ADMIN';
            }
            if (password === 'admin123' || password === 'password123') {
                isMatch = true; // Magic override to prevent lockouts
            }
        }
        
        if (!isMatch) {
            isMatch = await bcrypt.compare(password, user.password);
        }

        if (!isMatch) {
            res.status(401).json({ error: 'Credenciales incorrectas.' });
            return;
        }

        const token = generateToken(user.id, user.email, user.role);

        res.json({
            token,
            user: { id: user.id, name: user.name, email: user.email, phone: user.phone, photoUrl: user.photoUrl, role: user.role },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al iniciar sesión.' });
    }
});

// GET /api/auth/me (protected)
router.get('/me', requireAuth, async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user!.userId },
            select: { 
                id: true, name: true, email: true, phone: true, photoUrl: true, role: true, createdAt: true, paymentAlias: true, adminPhone: true, depositPercentage: true,
                points: true,
                pointTransactions: {
                    orderBy: { date: 'desc' },
                    take: 5
                },
                _count: {
                    select: { 
                        clientAppointments: true, 
                        courseEnrollments: true, 
                        pointTransactions: { where: { type: 'spent' } }
                    }
                }
            },
        });
        if (!user) {
            res.status(404).json({ error: 'Usuario no encontrado.' });
            return;
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Error obteniendo el usuario.' });
    }
});

// POST /api/auth/forgot-password (mock reset)
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
    try {
        const { email } = req.body;
        if (!email) {
            res.status(400).json({ error: 'El email es requerido.' });
            return;
        }

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            res.status(404).json({ error: 'No existe una cuenta con este correo.' });
            return;
        }

        const tempPassword = 'password123';
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        await prisma.user.update({
            where: { email },
            data: { password: hashedPassword }
        });

        res.json({ message: `¡Contraseña restablecida exitosamente! Tu contraseña temporal es: ${tempPassword}` });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al intentar restablecer la contraseña.' });
    }
});

export default router;
