import express from 'express';
import cors from 'cors';
import path from 'path';
import dotenv from 'dotenv';
import { PrismaClient } from './generated/client/client';
import servicesRouter from './routes/services';
import appointmentsRouter from './routes/appointments';
import usersRouter from './routes/users';
import authRouter from './routes/auth';
import reviewsRouter from './routes/reviews';
import remindersRouter from './routes/reminders';
import portfolioRouter from './routes/portfolio';
import promotionsRouter from './routes/promotions';
import { requireAuth } from './middleware/auth';
import { startReminderCronJob } from './cron/reminderJob';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

startReminderCronJob(); // Start cron job

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);
app.use('/api/services', servicesRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/portfolio', portfolioRouter);
app.use('/api/promotions', promotionsRouter);

// Protected routes
app.use('/api/appointments', requireAuth, appointmentsRouter);
app.use('/api/users', requireAuth, usersRouter);
app.use('/api/reminders', requireAuth, remindersRouter);

// Servir la carpeta de subidas de forma estática
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/', (req, res) => {
    res.send('Aesthetic Clinic API is running');
});

// Health check
app.get('/health', async (req, res) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.json({ status: 'ok', db: 'connected' });
    } catch (error) {
        res.status(500).json({ status: 'error', db: 'disconnected', error });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
