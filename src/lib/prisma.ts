import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const client =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query', 'error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = client

// Handle connection errors gracefully
client.$connect().catch((error) => {
  console.error('🔴 Failed to connect to database:', error)
})

// Graceful shutdown
process.on('beforeExit', async () => {
  await client.$disconnect()
})
