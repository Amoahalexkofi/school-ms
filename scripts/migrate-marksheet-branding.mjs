// Idempotent tenant-wide migration: report-card branding fields on
// TemplateMarksheet (headerColor, footerText, watermark).
//
// Run: npx dotenv -e .env -- node scripts/migrate-marksheet-branding.mjs
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
  const hasTable = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'TemplateMarksheet' LIMIT 1`;
  if (hasTable.length === 0) { console.log(`- ${schema}: no TemplateMarksheet table, skipping`); skip++; continue; }

  const stmts = [
    `ALTER TABLE "${schema}"."TemplateMarksheet" ADD COLUMN IF NOT EXISTS "headerColor" TEXT`,
    `ALTER TABLE "${schema}"."TemplateMarksheet" ADD COLUMN IF NOT EXISTS "footerText" TEXT`,
    `ALTER TABLE "${schema}"."TemplateMarksheet" ADD COLUMN IF NOT EXISTS "watermark" BOOLEAN NOT NULL DEFAULT false`,
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
