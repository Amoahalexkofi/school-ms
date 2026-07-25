// Idempotent tenant-wide migration for the Calendar/Events module.
// Creates the CalendarEvent table in every tenant schema:
//   visibility  TEXT — "PUBLIC" | "ROLE" | "PRIVATE" | "TASK" (app-validated,
//   not a Postgres enum — see prisma/schema.prisma comment on CalendarEvent).
//
// Run: npx dotenv -e .env -- node scripts/migrate-calendar-events.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
const sql = neon(url);

let schemas = [];
try {
  const rows = await sql`SELECT "schemaName" FROM public."SchoolTenant" ORDER BY "schemaName"`;
  schemas = rows.map((r) => r.schemaName).filter(Boolean);
} catch (e) {
  console.error("Could not read public.SchoolTenant:", e.message);
  process.exit(1);
}
if (!schemas.includes("public")) schemas.push("public");

console.log(`Migrating ${schemas.length} schema(s): ${schemas.join(", ")}\n`);

let ok = 0, skip = 0, fail = 0;

for (const schema of schemas) {
  const hasUser = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'User' LIMIT 1`;
  if (hasUser.length === 0) { console.log(`- ${schema}: no User table, skipping`); skip++; continue; }

  const stmts = [
    `CREATE TABLE IF NOT EXISTS "${schema}"."CalendarEvent" (
      "id" TEXT NOT NULL,
      "title" TEXT NOT NULL,
      "description" TEXT,
      "startDate" TIMESTAMP(3) NOT NULL,
      "endDate" TIMESTAMP(3) NOT NULL,
      "color" TEXT NOT NULL DEFAULT '#4f46e5',
      "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
      "createdById" TEXT NOT NULL,
      "creatorRole" TEXT NOT NULL,
      "isDone" BOOLEAN NOT NULL DEFAULT false,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById")
        REFERENCES "${schema}"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE
    )`,
    `CREATE INDEX IF NOT EXISTS "CalendarEvent_createdById_idx" ON "${schema}"."CalendarEvent"("createdById")`,
    `CREATE INDEX IF NOT EXISTS "CalendarEvent_startDate_idx" ON "${schema}"."CalendarEvent"("startDate")`,
  ];

  try {
    for (const stmt of stmts) await sql.query(stmt);
    console.log(`✓ ${schema}`);
    ok++;
  } catch (e) {
    console.error(`✗ ${schema}: ${e.message}`);
    fail++;
  }
}

console.log(`\nDone. ok=${ok} skip=${skip} fail=${fail}`);
process.exit(fail ? 1 : 0);
