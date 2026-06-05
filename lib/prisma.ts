import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Multi-tenant aware Prisma client.
 *
 * Each school deployment sets DATABASE_SCHEMA=school_abc123 in their
 * Vercel environment variables. All queries automatically run in that
 * school's isolated Postgres schema.
 *
 * Default = "public" (used for dev, demo, and the company registry).
 */
function createPrismaClient() {
  const schema = process.env.DATABASE_SCHEMA ?? "public";
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    options: `-c search_path="${schema}",public`,
    max: 10,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const g = globalThis as unknown as { _prisma: PrismaClient };
export const prisma: PrismaClient = g._prisma ?? createPrismaClient();
if (process.env.NODE_ENV !== "production") g._prisma = prisma;
