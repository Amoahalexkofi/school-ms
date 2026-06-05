/**
 * Per-request, tenant-aware Prisma client.
 *
 * Reads the x-tenant-schema header set by proxy.ts (from subdomain lookup).
 * Falls back to DATABASE_SCHEMA env var (per-deployment model) then "public".
 *
 * Clients are cached by schema name so we don't open a new pool every request.
 */
import { headers } from "next/headers";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const clientCache = new Map<string, PrismaClient>();

function createClient(schema: string): PrismaClient {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL!,
    options: `-c search_path="${schema}",public`,
    max: 5,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export async function getDb(): Promise<PrismaClient> {
  const h = await headers();
  const schema =
    h.get("x-tenant-schema") ??
    process.env.DATABASE_SCHEMA ??
    "public";

  if (!clientCache.has(schema)) {
    clientCache.set(schema, createClient(schema));
  }
  return clientCache.get(schema)!;
}

// Synchronous version for contexts where headers() is unavailable (e.g. NextAuth authorize)
export function getDbForSchema(schema: string): PrismaClient {
  if (!clientCache.has(schema)) {
    clientCache.set(schema, createClient(schema));
  }
  return clientCache.get(schema)!;
}
