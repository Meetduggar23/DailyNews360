import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: ["warn", "error"],
    });
  }
  return prisma;
}

/**
 * Returns true when the database is reachable. Used for graceful
 * degradation - the news pipeline must keep working without a database.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    prisma = null;
  }
}

export type DB = PrismaClient;