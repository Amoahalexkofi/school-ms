// Idempotent tenant-wide migration for GES-style SBA (continuous assessment).
// Creates three tables in every tenant schema:
//   AssessmentComponent — weighted components (Class Work 20, Project 15, …)
//   ComponentMark       — per-student per-component scores
//   TermReport          — terminal report wrapper (attendance, conduct, remarks…)
//
// Run: npx dotenv -e .env -- node scripts/migrate-sba-tables.mjs
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
if (!schemas.includes("public")) schemas.push("public");

console.log(`Migrating ${schemas.length} schema(s): ${schemas.join(", ")}\n`);

let ok = 0, skip = 0, fail = 0;

for (const schema of schemas) {
  // Skip schemas that don't have the ExamGroup table (not provisioned / not a tenant).
  const hasExams = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'ExamGroup' LIMIT 1`;
  if (hasExams.length === 0) { console.log(`- ${schema}: no ExamGroup table, skipping`); skip++; continue; }

  const stmts = [
    `CREATE TABLE IF NOT EXISTS "${schema}"."AssessmentComponent" (
      "id" TEXT NOT NULL,
      "name" TEXT NOT NULL,
      "weight" DECIMAL(5,2) NOT NULL,
      "isExam" BOOLEAN NOT NULL DEFAULT false,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "isActive" BOOLEAN NOT NULL DEFAULT true,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "AssessmentComponent_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE TABLE IF NOT EXISTS "${schema}"."ComponentMark" (
      "id" TEXT NOT NULL,
      "examScheduleId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "componentId" TEXT NOT NULL,
      "marksObtained" DECIMAL(5,2),
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "ComponentMark_pkey" PRIMARY KEY ("id"),
      CONSTRAINT "ComponentMark_componentId_fkey" FOREIGN KEY ("componentId")
        REFERENCES "${schema}"."AssessmentComponent"("id") ON DELETE RESTRICT ON UPDATE CASCADE
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "ComponentMark_examScheduleId_studentId_componentId_key"
      ON "${schema}"."ComponentMark"("examScheduleId", "studentId", "componentId")`,
    `CREATE INDEX IF NOT EXISTS "ComponentMark_examScheduleId_idx" ON "${schema}"."ComponentMark"("examScheduleId")`,
    `CREATE INDEX IF NOT EXISTS "ComponentMark_studentId_idx" ON "${schema}"."ComponentMark"("studentId")`,
    `CREATE TABLE IF NOT EXISTS "${schema}"."TermReport" (
      "id" TEXT NOT NULL,
      "examGroupId" TEXT NOT NULL,
      "studentId" TEXT NOT NULL,
      "attendancePresent" INTEGER,
      "attendanceTotal" INTEGER,
      "conduct" TEXT,
      "attitude" TEXT,
      "interest" TEXT,
      "classTeacherRemark" TEXT,
      "headTeacherRemark" TEXT,
      "promotedTo" TEXT,
      "nextTermBegins" DATE,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      CONSTRAINT "TermReport_pkey" PRIMARY KEY ("id")
    )`,
    `CREATE UNIQUE INDEX IF NOT EXISTS "TermReport_examGroupId_studentId_key"
      ON "${schema}"."TermReport"("examGroupId", "studentId")`,
    `CREATE INDEX IF NOT EXISTS "TermReport_examGroupId_idx" ON "${schema}"."TermReport"("examGroupId")`,
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
