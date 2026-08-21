import { headers } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { neon } from "@neondatabase/serverless";
import { ApplyForm } from "./ApplyForm";

async function fetchSchoolData(schema: string) {
  try {
    const sql = neon(process.env.DATABASE_URL!);
    const [profileRows, tenantRows, settingsRows] = await Promise.all([
      (sql as any).query(`SELECT * FROM "${schema}"."SchoolProfile" LIMIT 1`).then((r: any) => r.rows ?? r).catch(() => []),
      (sql as any).query(`SELECT name, subdomain FROM "SchoolTenant" WHERE "schemaName" = $1 LIMIT 1`, [schema]).then((r: any) => r.rows ?? r).catch(() => []),
      (sql as any).query(`SELECT "primaryColor" FROM "${schema}"."WebsiteSettings" LIMIT 1`).then((r: any) => r.rows ?? r).catch(() => []),
    ]);
    return {
      profile: profileRows[0] ?? null,
      tenant: tenantRows[0] ?? null,
      primaryColor: settingsRows[0]?.primaryColor ?? "#6366f1",
    };
  } catch {
    return { profile: null, tenant: null, primaryColor: "#6366f1" };
  }
}

function formatName(raw: string): string {
  if (/^[a-z0-9-_]+$/.test(raw)) return raw.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return raw;
}

function darken(hex: string, amount: number): string {
  const n = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, (n >> 16) - Math.round(255 * amount));
  const g = Math.max(0, ((n >> 8) & 0xff) - Math.round(255 * amount));
  const b = Math.max(0, (n & 0xff) - Math.round(255 * amount));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

function relativeLuminance(hex: string): number {
  const n = parseInt(hex.replace("#", ""), 16);
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const r = toLinear((n >> 16) & 0xff);
  const g = toLinear((n >> 8) & 0xff);
  const b = toLinear(n & 0xff);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

function ensureAccessibleAccent(hex: string): string {
  let candidate = hex;
  let amount = 0;
  while (contrastRatio(candidate, "#ffffff") < 4.5 && amount < 0.9) {
    amount += 0.05;
    candidate = darken(hex, amount);
  }
  return candidate;
}

export async function generateMetadata() {
  const h = await headers();
  const schema = h.get("x-tenant-schema");
  if (!schema) return { title: "Apply — Skula" };
  const { profile, tenant } = await fetchSchoolData(schema);
  const name = formatName(profile?.name ?? tenant?.name ?? schema);
  return { title: `Apply for Admission — ${name}` };
}

export default async function ApplyPage() {
  const h = await headers();
  const schema = h.get("x-tenant-schema");

  // This form writes into the requesting tenant's own schema (getDb() in the
  // API route resolves it from the same header) — with no tenant to write
  // into, submissions would silently land in the platform's shared "public"
  // schema instead of any real school's data.
  if (!schema) redirect("/");

  const { profile, tenant, primaryColor } = await fetchSchoolData(schema);
  const rawName  = profile?.name ?? tenant?.name ?? schema;
  const name     = formatName(rawName);
  const color    = ensureAccessibleAccent(primaryColor);
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
  const subdomain = tenant?.subdomain;
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.split(",")[0]?.trim() ?? "getskula.com";
  const websiteUrl = subdomain ? `https://${subdomain}.${appDomain}` : "/";

  return (
    <div className="min-h-screen bg-[#f6f9fc]">
      {/* ── Brand bar ── */}
      <div className="w-full" style={{ background: `linear-gradient(160deg, ${darken(color, 0.32)} 0%, ${color} 100%)` }}>
        <div className="max-w-3xl mx-auto px-6 pt-6 pb-14 sm:pt-8 sm:pb-20">
          <a href={websiteUrl}
            className="inline-flex items-center gap-2 pl-3 pr-1 py-1 rounded-full text-white/75 hover:text-white text-[12px] font-semibold transition-colors mb-8"
            style={{ background: "rgba(255,255,255,0.12)" }}>
            Back to website
            <span className="flex items-center justify-center w-5 h-5 rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
              <ArrowLeft className="h-3 w-3" />
            </span>
          </a>

          <div className="flex items-center gap-4">
            {profile?.logo ? (
              <img src={profile.logo} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0"
                style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.3)" }} />
            ) : (
              <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                style={{ background: "rgba(255,255,255,0.18)", border: "2px solid rgba(255,255,255,0.35)" }}>
                <span className="text-white font-black text-[20px] tracking-tight">{initials}</span>
              </div>
            )}
            <div>
              <p className="text-white/60 text-[11px] font-bold uppercase tracking-[0.14em] mb-1">Admission Application</p>
              <h1 className="font-bitter text-white font-bold tracking-tight leading-tight" style={{ fontSize: "clamp(22px, 3vw, 30px)" }}>
                {name}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ── Form card — pulled up over the brand bar ── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 -mt-8 pb-16">
        <ApplyForm accentColor={color} schoolName={name} />
      </div>
    </div>
  );
}
