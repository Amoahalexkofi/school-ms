import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";

export async function GET(req: NextRequest) {
  const h = await headers();
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");
  const tenantSchema = h.get("x-tenant-schema");

  // Try schema lookup
  let schemaFromDb: string | null = null;
  const rawHost = (forwardedHost ?? host ?? "").split(":")[0];
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "novalss.com";
  if (rawHost.endsWith(`.${appDomain}`)) {
    const subdomain = rawHost.slice(0, -(appDomain.length + 1));
    try {
      const sql = neon(process.env.DATABASE_URL!);
      const rows = await sql`SELECT "schemaName" FROM "SchoolTenant" WHERE subdomain = ${subdomain} LIMIT 1`;
      schemaFromDb = rows[0]?.schemaName ?? null;
    } catch (e: any) {
      schemaFromDb = `error: ${e.message}`;
    }
  }

  return NextResponse.json({
    "req.headers.x-forwarded-host": forwardedHost,
    "req.headers.host": host,
    "next/headers x-tenant-schema": tenantSchema,
    rawHost,
    schemaFromDb,
  });
}
