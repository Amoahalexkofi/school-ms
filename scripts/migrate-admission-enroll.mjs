// Idempotent tenant-wide migration for the admission → enroll flow.
// Adds two nullable columns to every tenant schema:
//   Student.applicationId            (unique)  — back-link to the application
//   AdmissionApplication.enrolledStudentId     — set when enrolled
//
// Run: npx dotenv -e .env -- node scripts/migrate-admission-enroll.mjs
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
// Also cover the default 'public' schema in case base tables live there too.
if (!schemas.includes("public")) schemas.push("public");

console.log(`Migrating ${schemas.length} schema(s): ${schemas.join(", ")}\n`);

let ok = 0, skip = 0, fail = 0;

for (const schema of schemas) {
  // Skip schemas that don't have the Student table (not provisioned / not a tenant).
  const hasStudent = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'Student' LIMIT 1`;
  if (hasStudent.length === 0) { console.log(`- ${schema}: no Student table, skipping`); skip++; continue; }

  const stmts = [
    `ALTER TABLE "${schema}"."Student" ADD COLUMN IF NOT EXISTS "applicationId" TEXT`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "Student_applicationId_key" ON "${schema}"."Student"("applicationId")`,
    `ALTER TABLE "${schema}"."AdmissionApplication" ADD COLUMN IF NOT EXISTS "enrolledStudentId" TEXT`,
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
