import 'dotenv/config'
import { PrismaClient, Role } from './generated/client/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    // Ensure admin user exists
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

    // Ensure a service exists
    let service = await prisma.service.findFirst()
    if (!service) {
        service = await prisma.service.create({
            data: {
                name: 'Test Service',
                description: 'A test service',
                price: 10,
                durationMinutes: 30
            }
        })
    }

    // Create a COMPLETED appointment for admin
    await prisma.appointment.create({
        data: {
            dateTime: new Date(),
            status: 'COMPLETED',
            notes: 'Test appointment for review',
            clientId: admin.id,
            serviceId: service.id
        }
    })
    console.log('Test appointment created.')
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); })
