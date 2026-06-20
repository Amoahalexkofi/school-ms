import { NextRequest, NextResponse } from "next/server";
import { Pool } from "pg";
import { migrateEnumsForSchema } from "@/lib/provisioning";
import { requireNovalssAdmin } from "@/lib/auth/novalss";

export async function POST(req: NextRequest) {
  const denied = requireNovalssAdmin(req);
  if (denied) return denied;
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  const client = await pool.connect();
  const results: Record<string, string> = {};

  try {
    const tenants = await client.query<{ schemaName: string; subdomain: string }>(
      `SELECT "schemaName", subdomain FROM "SchoolTenant" WHERE status != 'suspended'`
    );

    for (const { schemaName, subdomain } of tenants.rows) {
      try {
        await migrateEnumsForSchema(client, schemaName);
        results[subdomain] = "ok";
      } catch (e: any) {
        results[subdomain] = `error: ${e.message}`;
      }
    }

    return NextResponse.json({ success: true, results });
  } finally {
    client.release();
    await pool.end();
  }
}
