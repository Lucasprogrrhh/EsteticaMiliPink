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
    console.log('[DIAG] ══════════════════════════════════════════');

    // 1. Host de la base de datos en runtime
    const dbUrl = process.env.DATABASE_URL || '';
    let dbHost = '(DATABASE_URL no definida)';
    try { dbHost = new URL(dbUrl).hostname; } catch { dbHost = '(no parseable)'; }
    console.log(`[DIAG] DB HOST: ${dbHost}`);

    try {
        // 2. Total de turnos y fecha más reciente
        const stats = await prisma.$queryRawUnsafe<any[]>(`
            SELECT COUNT(*) as total, MAX("dateTime") as last_dt, MAX("createdAt") as last_created
            FROM "Appointment"
        `);
        const s = stats[0];
        console.log(`[DIAG] Total Appointments: ${s.total}`);
        console.log(`[DIAG] MAX(dateTime):  ${s.last_dt}`);
        console.log(`[DIAG] MAX(createdAt): ${s.last_created}`);

        // 3. Duplicados activos (PENDING/CONFIRMED en el mismo dateTime)
        const dupes = await prisma.$queryRawUnsafe<any[]>(`
            SELECT "dateTime", COUNT(*) as qty, array_agg(id) as ids
            FROM "Appointment"
            WHERE status IN ('PENDING', 'CONFIRMED')
            GROUP BY "dateTime"
            HAVING COUNT(*) > 1
        `);
        if (dupes.length === 0) {
            console.log('[DIAG] Duplicados activos: NINGUNO ✅ — índice funcionando correctamente');
        } else {
            console.log(`[DIAG] ⚠️  DUPLICADOS ACTIVOS ENCONTRADOS (${dupes.length} conflicto/s):`);
            dupes.forEach(d => console.log(`  → dateTime=${d.dateTime} | qty=${d.qty} | ids=${d.ids}`));
        }

        // 4. ¿Existe el índice único parcial en esta base?
        const idx = await prisma.$queryRawUnsafe<any[]>(`
            SELECT indexname FROM pg_indexes
            WHERE tablename = 'Appointment'
            AND indexname = 'Appointment_dateTime_unique_partial'
        `);
        console.log(`[DIAG] Índice único parcial: ${idx.length > 0 ? 'EXISTE ✅' : 'NO EXISTE ⚠️  (se creará en startServer)'}`);

    } catch (err: any) {
        console.error('[DIAG] Error en diagnóstico:', err.message);
    }

    console.log('[DIAG] ══════════════════════════════════════════');
};
// ── FIN DIAGNÓSTICO TEMPORAL ─────────────────────────────────────────────────

runDiagnostic().then(() => startServer());
