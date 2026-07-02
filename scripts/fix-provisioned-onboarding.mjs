// One-time data fix: release already-provisioned schools from the onboarding
// wizard trap. For every tenant schema (and public):
//   1. SchoolProfile.onboardingCompleted → true
//   2. If the schema has NO academic session, seed an active one (Sep–Jul)
//
// Run: npx dotenv -e .env -- node scripts/fix-provisioned-onboarding.mjs
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL not set"); process.exit(1); }
const sql = neon(url);

const cuid = () => "c" + Math.random().toString(36).slice(2, 11) + Date.now().toString(36);

let schemas = [];
try {
  const rows = await sql`SELECT "schemaName" FROM public."SchoolTenant" ORDER BY "schemaName"`;
  schemas = rows.map((r) => r.schemaName).filter(Boolean);
} catch (e) {
  console.error("Could not read public.SchoolTenant:", e.message);
  process.exit(1);
}
if (!schemas.includes("public")) schemas.push("public");

for (const schema of schemas) {
  const hasProfile = await sql`
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = ${schema} AND table_name = 'SchoolProfile' LIMIT 1`;
  if (hasProfile.length === 0) { console.log(`- ${schema}: no SchoolProfile table, skipping`); continue; }

  const flagged = await sql.query(
    `UPDATE "${schema}"."SchoolProfile" SET "onboardingCompleted" = true WHERE "onboardingCompleted" = false`
  );

  const sessions = await sql.query(`SELECT COUNT(*)::int c FROM "${schema}"."AcademicSession"`);
  let seeded = false;
  if (sessions[0].c === 0) {
    const now = new Date();
    const startYear = now.getMonth() >= 7 ? now.getFullYear() : now.getFullYear() - 1;
    await sql.query(
      `INSERT INTO "${schema}"."AcademicSession" (id, session, "startDate", "endDate", "isActive", "createdAt")
       VALUES ($1, $2, $3, $4, true, NOW())`,
      [cuid(), `${startYear}/${startYear + 1}`,
       new Date(Date.UTC(startYear, 8, 1)).toISOString(),
       new Date(Date.UTC(startYear + 1, 6, 31)).toISOString()]
    );
    seeded = true;
  }

  console.log(`✓ ${schema}: onboarding flag set${seeded ? ", active session seeded" : `, ${sessions[0].c} session(s) already present`}`);
}

console.log("\nDone.");
