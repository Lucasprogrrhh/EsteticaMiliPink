import { PrismaClient } from './server/src/generated/client/client'

const prisma = new PrismaClient()

async function check() {
    try {
        const userCount = await prisma.user.count()
        const appointmentCount = await prisma.appointment.count()
        const users = await prisma.user.findMany({
            select: { email: true, role: true, name: true }
        })
        console.log("=== DB CHECK ===")
        console.log(`Total Usuarios: ${userCount}`)
        console.log(`Total Turnos: ${appointmentCount}`)
        console.log("Lista de Usuarios en DB:")
        console.dir(users)
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}

check()
