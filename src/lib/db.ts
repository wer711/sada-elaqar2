import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// On Vercel (serverless), SQLite may not work.
// We try to create the client but handle failures gracefully.
function createPrismaClient(): PrismaClient {
  try {
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query'] : [],
    })
  } catch {
    // Return a dummy client that will be handled in API routes
    return null as unknown as PrismaClient
  }
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Helper to check if DB is available
export const isDbAvailable = (): boolean => {
  try {
    return db !== null && typeof db.$connect === 'function'
  } catch {
    return false
  }
}
