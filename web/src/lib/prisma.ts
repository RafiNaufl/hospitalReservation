import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL must be set");
}

if (
  connectionString.startsWith("prisma://") ||
  connectionString.startsWith("prisma+")
  ) {
  throw new Error(
    "DATABASE_URL must be a direct Postgres connection string (postgresql://...) when using @prisma/adapter-pg"
  );
}

const adapter = new PrismaPg({
  connectionString,
});

const prismaOptions: Prisma.PrismaClientOptions = {
  adapter,
  log: ["error", "warn"],
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient(prismaOptions);

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
