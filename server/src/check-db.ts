import 'dotenv/config'
import { PrismaClient } from './generated/client/client'

const prisma = new PrismaClient()

async function main() {
    const userCount = await prisma.user.count()
    const serviceCount = await prisma.service.count()

    console.log(`Users: ${userCount}`)
    console.log(`Services: ${serviceCount}`)

    if (userCount > 0 && serviceCount > 0) {
        console.log('Database verification SUCCESS')
    } else {
        console.log('Database verification FAILED')
        process.exit(1)
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
