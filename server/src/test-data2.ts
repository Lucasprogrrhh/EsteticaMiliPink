import 'dotenv/config'
import { PrismaClient } from './generated/client/client'

const prisma = new PrismaClient()

async function main() {
    const admin = await prisma.user.findUnique({ where: { email: 'admin@estetica.com' } })
    let service = await prisma.service.findFirst()
    
    if (admin && service) {
        await prisma.appointment.create({
            data: {
                dateTime: new Date(),
                status: 'COMPLETED',
                notes: 'Test appointment for photo review',
                clientId: admin.id,
                serviceId: service.id
            }
        })
        console.log('Second test appointment created.')
    }
}

main().then(() => prisma.$disconnect()).catch((e) => { console.error(e); prisma.$disconnect(); process.exit(1); })
