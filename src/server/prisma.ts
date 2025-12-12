import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../../generated/prisma/client'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

type GlobalPrisma = typeof globalThis & {
  prisma?: PrismaClient
}

const globalForPrisma = globalThis as GlobalPrisma

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  })

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
