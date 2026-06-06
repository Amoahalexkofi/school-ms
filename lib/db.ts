import { headers } from "next/headers";
import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";

const clientCache = new Map<string, PrismaClient>();

function createClient(schema: string): PrismaClient {
  const adapter = new PrismaNeon(
    { connectionString: process.env.DATABASE_URL! },
    { schema }
  );
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
