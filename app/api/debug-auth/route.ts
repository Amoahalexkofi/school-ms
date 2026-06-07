import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";

export async function GET(req: NextRequest) {
  const h = await headers();
  const novalssHost = req.headers.get("x-novalss-host");
  const forwardedHost = req.headers.get("x-forwarded-host");
  const host = req.headers.get("host");
  const tenantSchema = h.get("x-tenant-schema");

  // Try schema lookup
  let schemaFromDb: string | null = null;
  const rawHost = (novalssHost ?? forwardedHost ?? host ?? "").split(":")[0];
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

  let prismaStudentCount: number | string = "not tested";
  let prismaSearchPath: string = "not tested";
  let rawSqlCount: number | string = "not tested";
  let currentSchema: string = "not tested";
  try {
    const { getDb } = await import("@/lib/db");
    const db = await getDb();
    const spResult = await (db as any).$queryRawUnsafe("SHOW search_path");
    prismaSearchPath = spResult?.[0]?.search_path ?? "unknown";
    const schemaResult = await (db as any).$queryRawUnsafe("SELECT current_schema()");
    currentSchema = schemaResult?.[0]?.current_schema ?? "unknown";
    const rawCount = await (db as any).$queryRawUnsafe('SELECT COUNT(*) as cnt FROM "Student"');
    rawSqlCount = rawCount?.[0]?.cnt ?? "unknown";
    prismaStudentCount = await (db as any).student.count();
  } catch (e: any) {
    prismaStudentCount = `error: ${e.message}`;
  }

  return NextResponse.json({
    "x-novalss-host": novalssHost,
    "x-forwarded-host": forwardedHost,
    "host": host,
    "x-tenant-schema (next/headers)": tenantSchema,
    rawHost,
    schemaFromDb,
    prismaSearchPath,
    currentSchema,
    rawSqlCount,
    prismaStudentCount,
  });
}
