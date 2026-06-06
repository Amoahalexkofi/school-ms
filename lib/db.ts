import { headers } from "next/headers";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const clientCache = new Map<string, PrismaClient>();

function createClient(schema: string): PrismaClient {
  // search_path: tenant schema first so table lookups land in the right schema,
  // then public so unqualified enum types (UserRole, etc.) resolve via public.
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
    options: `-c search_path="${schema}",public`,
  });
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

export function getDbForSchema(schema: string): PrismaClient {
  if (!clientCache.has(schema)) {
    clientCache.set(schema, createClient(schema));
  }
  return clientCache.get(schema)!;
}
