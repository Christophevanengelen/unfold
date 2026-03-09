import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient | null {
  const url = process.env.DATABASE_URL;
  if (!url || url.includes("user:password")) {
    console.warn("[db] No valid DATABASE_URL — running without database.");
    return null;
  }
  try {
    const adapter = new PrismaPg({ connectionString: url });
    return new PrismaClient({ adapter });
  } catch {
    console.warn("[db] Could not initialize PrismaClient — running without database.");
    return null;
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.prisma = prisma;
}
