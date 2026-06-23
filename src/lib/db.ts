import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

let dbInstance: PrismaClient | null = null;

try {
  dbInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query'] : [],
  });
} catch {
  // SQLite not available (e.g., Vercel serverless) - DB operations will be skipped
  console.log("⚠️ Database not available - running without persistence");
}

export const db = dbInstance;

if (process.env.NODE_ENV !== 'production' && dbInstance) {
  globalForPrisma.prisma = dbInstance;
}
