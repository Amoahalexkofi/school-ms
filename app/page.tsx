import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { HomepageClient } from "./HomepageClient";
import { SchoolSite } from "./SchoolSite";
import { neon } from "@neondatabase/serverless";

async function q(sql: any, query: string, params: any[] = []) {
  try {
    const r = await (sql as any).query(query, params);
    return r.rows ?? r;
  } catch { return []; }
}

export async function generateMetadata() {
  const h = await headers();
  const schema = h.get("x-tenant-schema");
  if (!schema) return { title: "Skula — School Management System" };
  const sql = neon(process.env.DATABASE_URL!);
  const rows = await q(sql, `SELECT name FROM "SchoolTenant" WHERE "schemaName" = $1 LIMIT 1`, [schema]);
  const name = rows[0]?.name ?? "School Portal";
  return { title: `${name} — Student & Staff Portal`, description: `Sign in to your ${name} dashboard. Students, staff and parents.` };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const h = await headers();
  const schema = h.get("x-tenant-schema");
  const sp = await searchParams;
  // Logged-in admins can preview their public site with ?preview=1 instead of
  // being bounced to the dashboard.
  const preview = sp?.preview === "1" || sp?.preview === "true";

  // ── School subdomain ─────────────────────────────────────────────────────────
  if (schema) {
    const session = await auth();
    if (session?.user && !preview) redirect("/dashboard");

    const sql = neon(process.env.DATABASE_URL!);

    const [profileRows, tenantRows, slideRows, noticeRows, settingsRows, studentCount, staffCount, classCount] = await Promise.all([
      q(sql, `SELECT * FROM "${schema}"."SchoolProfile" LIMIT 1`),
      q(sql, `SELECT name FROM "SchoolTenant" WHERE "schemaName" = $1 LIMIT 1`, [schema]),
      q(sql, `SELECT * FROM "${schema}"."WebsiteHeroSlide" WHERE "isActive" = true ORDER BY "order" ASC`).catch(() => []),
      q(sql, `SELECT * FROM "${schema}"."WebsiteNotice" WHERE "isActive" = true AND ("expiresAt" IS NULL OR "expiresAt" > NOW()) ORDER BY "createdAt" DESC`).catch(() => []),
      q(sql, `SELECT * FROM "${schema}"."WebsiteSettings" LIMIT 1`).catch(() => []),
      q(sql, `SELECT COUNT(*) AS cnt FROM "${schema}"."Student"`).catch(() => [{ cnt: 0 }]),
      q(sql, `SELECT COUNT(*) AS cnt FROM "${schema}"."Staff"`).catch(() => [{ cnt: 0 }]),
      q(sql, `SELECT COUNT(*) AS cnt FROM "${schema}"."ClassSection"`).catch(() => [{ cnt: 0 }]),
    ]);

    const profile  = profileRows[0]  ?? null;
    const settings = settingsRows[0] ?? { primaryColor: "#6366f1", showStats: true };

    return (
      <SchoolSite
        profile={profile}
        schoolName={tenantRows[0]?.name ?? profile?.name ?? schema}
        slides={slideRows}
        notices={noticeRows}
        settings={settings}
        stats={{
          students: parseInt(studentCount[0]?.cnt ?? 0),
          staff:    parseInt(staffCount[0]?.cnt    ?? 0),
          classes:  parseInt(classCount[0]?.cnt    ?? 0),
        }}
        preview={preview && !!session?.user}
      />
    );
  }

  // ── Main Skula marketing site ────────────────────────────────────────────────
  const session = await auth();
  if (session?.user) redirect("/dashboard");
  return <HomepageClient />;
}
