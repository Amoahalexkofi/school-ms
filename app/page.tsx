import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HomepageClient } from "./HomepageClient";
import { SchoolLandingPage } from "./SchoolLandingPage";
import { neon } from "@neondatabase/serverless";

export default async function LandingPage() {
  const h = await headers();
  const tenantSchema = h.get("x-tenant-schema");

  // ── School subdomain ─────────────────────────────────────────────────────────
  if (tenantSchema) {
    const session = await auth();
    if (session?.user) redirect("/dashboard");

    // Fetch school profile and tenant name
    let profile = null;
    let schoolName = tenantSchema; // fallback
    try {
      const sql = neon(process.env.DATABASE_URL!);
      const [profileRows, tenantRows] = await Promise.all([
        (sql as any).query(`SELECT * FROM "${tenantSchema}"."SchoolProfile" LIMIT 1`),
        (sql as any).query(`SELECT name FROM "SchoolTenant" WHERE "schemaName" = $1 LIMIT 1`, [tenantSchema]),
      ]);
      profile = (profileRows.rows ?? profileRows)[0] ?? null;
      schoolName = (tenantRows.rows ?? tenantRows)[0]?.name ?? schoolName;
    } catch {}

    return <SchoolLandingPage profile={profile} schoolName={schoolName} />;
  }

  // ── Main Skula marketing site ────────────────────────────────────────────────
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <HomepageClient />;
}
