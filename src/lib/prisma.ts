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
    // Connection pooling configuration for serverless
    __internal: {
      engine: {
        connectionLimit: 1,
        pool: {
          min: 0,
          max: 1,
        },
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
