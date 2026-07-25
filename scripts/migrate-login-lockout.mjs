// Idempotent tenant-wide migration for sign-in brute-force lockout.
// Adds two nullable/defaulted columns to every tenant schema's User table:
//   failedLoginAttempts  INT NOT NULL DEFAULT 0
//   lockedUntil          TIMESTAMP NULL
//
// Run: npx dotenv -e .env -- node scripts/migrate-login-lockout.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
const sql = neon(url);

// Discover tenant schemas from the shared registry (public.SchoolTenant).
let schemas = [];
try {
  const rows = await sql`SELECT "schemaName" FROM public."SchoolTenant" ORDER BY "schemaName"`;
  schemas = rows.map((r) => r.schemaName).filter(Boolean);
} catch (e) {
  console.error("Could not read public.SchoolTenant:", e.message);
  process.exit(1);
}
// public itself already got this via `prisma db push` during development,
// but the ADD COLUMN IF NOT EXISTS below is a no-op if so — safe either way.
if (!schemas.includes("public")) schemas.push("public");

console.log(`Migrating ${schemas.length} schema(s): ${schemas.join(", ")}\n`);

let ok = 0, skip = 0, fail = 0;

for (const schema of schemas) {
  const hasUser = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'User' LIMIT 1`;
  if (hasUser.length === 0) { console.log(`- ${schema}: no User table, skipping`); skip++; continue; }

  const stmts = [
    `ALTER TABLE "${schema}"."User" ADD COLUMN IF NOT EXISTS "failedLoginAttempts" INTEGER NOT NULL DEFAULT 0`,
    `ALTER TABLE "${schema}"."User" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3)`,
  ];
  for (const stmt of stmts) {
    try {
      await sql.query(stmt);
      ok++;
    } catch (e) {
      console.error(`  ✗ ${schema}: ${e.message}`);
      fail++;
    }
  }
  console.log(`✓ ${schema}`);
}

console.log(`\nDone: ${ok} statements ok, ${skip} schema(s) skipped, ${fail} failed`);
process.exit(fail > 0 ? 1 : 0);
