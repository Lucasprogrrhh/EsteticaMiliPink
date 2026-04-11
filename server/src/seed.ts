import { PrismaClient, Role } from './generated/client/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Create Admin User
    const hashedPassword = await bcrypt.hash('password123', 10)
    const admin = await prisma.user.upsert({
        where: { email: 'admin@estetica.com' },
        update: {},
        create: {
            email: 'admin@estetica.com',
            name: 'Admin User',
            password: hashedPassword,
            role: Role.ADMIN,
        },
    })
    console.log({ admin })

    // Create Services (upsert by name to avoid duplicates)
    const services = [
        {
            name: 'Limpieza Facial Profunda',
            description: 'Tratamiento completo de limpieza facial con extracción e hidratación.',
            price: 50.00,
            durationMinutes: 60,
        },
        {
            name: 'Masaje Relajante',
            description: 'Masaje de cuerpo completo para reducir el estrés y la tensión muscular.',
            price: 45.00,
            durationMinutes: 45,
        },
        {
            name: 'Depilación Laser',
            description: 'Sesión de depilación laser en zona a elección.',
            price: 80.00,
            durationMinutes: 30,
        },
        {
            name: 'Manicura Semipermanente',
            description: 'Esmaltado semipermanente en manos con diseño rápido.',
            price: 25.00,
            durationMinutes: 45,
        },
        {
            name: 'Pedicura Spa',
            description: 'Limpieza profunda, exfoliación, masaje y esmaltado en pies.',
            price: 35.00,
            durationMinutes: 60,
        },
    ]

    for (const service of services) {
        // Check if it already exists by name
        const existing = await prisma.service.findFirst({ where: { name: service.name } })
        if (!existing) {
            const s = await prisma.service.create({ data: service })
            console.log(`Created service: ${s.name}`)
        } else {
            console.log(`Service already exists: ${service.name} (skipped)`)
        }
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
