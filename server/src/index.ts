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
import coursesRouter from './routes/courses';
import timeSlotsRouter from './routes/timeSlots';
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
app.use('/api/courses', coursesRouter);
app.use('/api/time-slots', timeSlotsRouter);

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

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err);
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'La imagen excede el límite de tamaño de 20MB' });
        }
        return res.status(400).json({ error: `Error de subida: ${err.message}` });
    }
    res.status(err.status || 500).json({ error: err.message || 'Error interno del servidor' });
});

// Inicializar índice único parcial de base de datos y luego arrancar el servidor
const startServer = async () => {
    try {
        console.log("Verificando índice único parcial en base de datos...");
        await prisma.$executeRawUnsafe(`
            CREATE UNIQUE INDEX IF NOT EXISTS "Appointment_dateTime_unique_partial" 
            ON "Appointment" ("dateTime") 
            WHERE "status" IN ('PENDING', 'CONFIRMED');
        `);
        console.log("Base de datos inicializada correctamente.");
    } catch (error) {
        console.error("Error crítico al inicializar base de datos:", error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
};

// ── DIAGNÓSTICO TEMPORAL ── eliminar tras confirmación ──────────────────────
const runDiagnostic = async () => {
    // 1. Mostrar HOST de DATABASE_URL sin exponer credenciales
    const dbUrl = process.env.DATABASE_URL || '';
    let dbHost = '(DATABASE_URL no definida)';
    try {
        const parsed = new URL(dbUrl);
        dbHost = parsed.hostname;
    } catch {
        dbHost = '(no se pudo parsear DATABASE_URL)';
    }
    console.log(`[DIAG] DB HOST en runtime: ${dbHost}`);

    // 2. Consultar el registro de Delfina Naguel vía Prisma (misma conexión de producción)
    try {
        const result = await prisma.$queryRawUnsafe<any[]>(`
            SELECT a.id, a."dateTime", a.status, u.name, u.email, s.name as service
            FROM "Appointment" a
            JOIN "User" u ON a."clientId" = u.id
            JOIN "Service" s ON a."serviceId" = s.id
            WHERE u.email = 'delfinamnaguel2@gmail.com'
        `);
        if (result.length > 0) {
            console.log(`[DIAG] Registro de Delfina Naguel ENCONTRADO en la DB en runtime (${result.length} turno/s):`);
            result.forEach(r => console.log(`  → id=${r.id} | fecha=${r.dateTime} | estado=${r.status} | servicio=${r.service}`));
        } else {
            console.log(`[DIAG] Registro de Delfina Naguel NO encontrado en la DB en runtime. La app está usando una base de datos diferente a Supabase.`);
        }
    } catch (err: any) {
        console.error(`[DIAG] Error al consultar Delfina Naguel:`, err.message);
    }
};
// ── FIN DIAGNÓSTICO TEMPORAL ─────────────────────────────────────────────────

runDiagnostic().then(() => startServer());
