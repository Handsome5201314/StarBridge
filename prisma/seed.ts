import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.inviteCode.upsert({
    where: { code: 'STARBRIDGE-DEMO' },
    update: {
      status: 'active',
      maxUses: 100,
      note: 'Default StarBridge public-preview invite code',
    },
    create: {
      code: 'STARBRIDGE-DEMO',
      status: 'active',
      maxUses: 100,
      note: 'Default StarBridge public-preview invite code',
    },
  })
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
