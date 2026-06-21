import { headers } from "next/headers";
import { neon } from "@neondatabase/serverless";
import { ensureWebsiteTables } from "@/lib/website-utils";
import { WebsiteClient } from "./WebsiteClient";

async function q(sql: any, query: string, params: any[] = []) {
  try { const r = await (sql as any).query(query, params); return r.rows ?? r; }
  catch { return []; }
}

export default async function WebsitePage() {
  const h = await headers();
  const schema = h.get("x-tenant-schema") ?? process.env.DATABASE_SCHEMA ?? "public";
  const host   = h.get("x-novalss-host") ?? h.get("host") ?? "";

  const sql = neon(process.env.DATABASE_URL!);
  await ensureWebsiteTables(sql, schema);

  const [slides, notices, settingsRows, tenantRows] = await Promise.all([
    q(sql, `SELECT * FROM "${schema}"."WebsiteHeroSlide" ORDER BY "order" ASC`),
    q(sql, `SELECT * FROM "${schema}"."WebsiteNotice" ORDER BY "createdAt" DESC`),
    q(sql, `SELECT * FROM "${schema}"."WebsiteSettings" LIMIT 1`),
    q(sql, `SELECT subdomain FROM "SchoolTenant" WHERE "schemaName" = $1 LIMIT 1`, [schema]),
  ]);

  const settings = settingsRows[0] ?? { primaryColor: "#6366f1", showStats: true };
  const subdomain = tenantRows[0]?.subdomain;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.split(",")[0]?.trim() ?? "getskula.com";
  // ?preview=1 lets a logged-in admin view the public site instead of being
  // redirected to the dashboard.
  const baseUrl = subdomain ? `https://${subdomain}.${appDomain}` : `https://${host}`;
  const schoolUrl = `${baseUrl}/?preview=1`;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <WebsiteClient
        initialSlides={slides}
        initialNotices={notices}
        initialSettings={settings}
        schoolUrl={schoolUrl}
      />
    </div>
  );
}
