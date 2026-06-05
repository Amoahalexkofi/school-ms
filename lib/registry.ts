/**
 * Registry client — always connects to the PUBLIC schema.
 * Used for SchoolTenant CRUD regardless of DATABASE_SCHEMA env var.
 */
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

function createRegistryClient() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    options: `-c search_path="public"`,
    max: 5,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

const g = globalThis as unknown as { _registry: PrismaClient };
export const registry: PrismaClient = g._registry ?? createRegistryClient();
if (process.env.NODE_ENV !== "production") g._registry = registry;
