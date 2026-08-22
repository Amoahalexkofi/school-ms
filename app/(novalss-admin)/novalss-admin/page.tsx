export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Pool } from "pg";
import { registry } from "@/lib/registry";
import { NovalssAdminClient } from "./NovalssAdminClient";

// Fails CLOSED, matching lib/auth/novalss.ts's API-layer check — an unset
// env var must never fall back to a guessable default that would expose
// every school's data through this page.
const ADMIN_KEY = process.env.NOVALSS_ADMIN_KEY;

// Each school's real logo lives in its own tenant schema (SchoolProfile.logo,
// set from Settings → School Profile), not in the shared registry — so it
// takes one cross-schema query per tenant to show it instead of a generic icon.
async function attachLogos(schools: { schemaName: string; logoUrl?: string | null }[]) {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
  try {
    const logos = await Promise.all(
      schools.map(async (s) => {
        try {
          const r = await pool.query(`SELECT logo FROM "${s.schemaName}"."SchoolProfile" LIMIT 1`);
          return r.rows[0]?.logo || null;
        } catch {
          return null;
        }
      })
    );
    schools.forEach((s, i) => { s.logoUrl = logos[i]; });
  } finally {
    await pool.end();
  }
  return schools;
}

async function getData() {
  try {
    const schools = await (registry as any).schoolTenant.findMany({
      orderBy: { createdAt: "desc" },
    });
    await attachLogos(schools);
    return { schools };
  } catch (e) {
    console.error("[novalss-admin] registry query failed:", e);
    return { schools: [] };
  }
}

export default async function NovalssAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>;
}) {
  const cookieStore = await cookies();
  const params = await searchParams;

  // Check key from URL param (first-time access) or cookie (subsequent visits)
  const urlKey = params.key;
  const cookieKey = cookieStore.get("novalss_admin_key")?.value;

  if (!ADMIN_KEY || (urlKey !== ADMIN_KEY && cookieKey !== ADMIN_KEY)) {
    redirect("/novalss-admin/login");
  }

  const { schools } = await getData();
  return <NovalssAdminClient schools={schools} />;
}
