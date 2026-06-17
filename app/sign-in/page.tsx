import { headers } from "next/headers";
import { GraduationCap, ArrowLeft, MapPin, Phone, Mail } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";
import Link from "next/link";
import { neon } from "@neondatabase/serverless";

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

export default async function SignInRoute() {
  const h = await headers();
  const tenantSchema = h.get("x-tenant-schema");
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  // ── School subdomain ──────────────────────────────────────────────────────
  if (tenantSchema) {
    const { profile, tenant: tenantRow, primaryColor } = await fetchSchoolData(tenantSchema);
    const rawName   = profile?.name ?? tenantRow?.name ?? tenantSchema;
    const name      = formatName(rawName);
    const color     = primaryColor;
    const dark      = darken(color, 0.38);
    const initials  = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
    const subdomain = tenantRow?.subdomain;
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.split(",")[0]?.trim() ?? "getskula.com";
    const websiteUrl = subdomain ? `https://${subdomain}.${appDomain}` : "/";
    const location  = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");
    const year      = profile?.established ?? profile?.foundedYear ?? null;

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div
          className="lg:w-[44%] xl:w-[40%] flex flex-col relative overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${dark} 0%, ${color} 100%)` }}
        >
          {/* Subtle inner glow at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.25), transparent)" }} />

          {/* Large decorative initial — bottom right, very faint */}
          <div className="absolute -bottom-6 -right-4 pointer-events-none select-none font-black text-white leading-none"
            style={{ fontSize: 180, opacity: 0.06 }}>
            {initials[0] ?? "S"}
          </div>

          <div className="relative flex flex-col h-full px-10 xl:px-12 py-10 min-h-[520px] lg:min-h-0">

            {/* Back to website */}
            <div className="shrink-0">
              <a href={websiteUrl} className="inline-flex items-center gap-2 text-white/60 hover:text-white text-[13px] font-semibold transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to website
              </a>
            </div>

            {/* Main identity block */}
            <div className="flex-1 flex flex-col justify-center py-8">

              {/* Logo */}
              <div className="mb-7">
                {profile?.logo ? (
                  <img src={profile.logo} alt={name}
                    className="w-24 h-24 rounded-full object-cover"
                    style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.3), 0 8px 32px rgba(0,0,0,0.3)" }} />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.18)",
                      border: "2px solid rgba(255,255,255,0.35)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
                    }}
                  >
                    <span className="text-white font-black text-[34px] tracking-tight">{initials}</span>
                  </div>
                )}
              </div>

              {/* Name */}
              <h1 className="text-white font-black tracking-tight leading-[1.05] mb-1"
                style={{ fontSize: "clamp(28px, 3.2vw, 44px)" }}>
                {name}
              </h1>

              {/* Year + location */}
              {(year || location) && (
                <p className="text-white/55 text-[13px] font-medium mb-5">
                  {year ? `Est. ${year}` : ""}
                  {year && location ? "  ·  " : ""}
                  {location}
                </p>
              )}

              {/* Divider */}
              <div className="w-12 h-[2px] rounded-full mb-5" style={{ background: "rgba(255,255,255,0.3)" }} />

              {/* Motto */}
              {profile?.motto ? (
                <p className="text-white/65 text-[14px] italic leading-relaxed mb-7 max-w-[260px]">
                  &ldquo;{profile.motto}&rdquo;
                </p>
              ) : (
                <p className="text-white/50 text-[13px] leading-relaxed mb-7">
                  Student &amp; Staff Portal
                </p>
              )}

              {/* Contact details */}
              {(profile?.phone || profile?.email) && (
                <div className="space-y-2.5">
                  {profile?.phone && (
                    <div className="flex items-center gap-2.5 text-white/55 text-[13px]">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)" }}>
                        <Phone className="h-3 w-3 text-white/70" />
                      </div>
                      {profile.phone}
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center gap-2.5 text-white/55 text-[13px]">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)" }}>
                        <Mail className="h-3 w-3 text-white/70" />
                      </div>
                      {profile.email}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Portal access row */}
            <div className="shrink-0 mb-6">
              <p className="text-white/35 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">Portal access for</p>
              <div className="flex gap-2 flex-wrap">
                {["Students", "Parents", "Staff", "Admin"].map(role => (
                  <span key={role}
                    className="text-[11px] font-semibold px-3 py-1.5 rounded-full"
                    style={{ background: "rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)", border: "1px solid rgba(255,255,255,0.18)" }}>
                    {role}
                  </span>
                ))}
              </div>
            </div>

            {/* Powered by */}
            <div className="shrink-0">
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
                className="text-white/28 hover:text-white/60 text-[10.5px] font-bold tracking-[0.15em] uppercase transition-colors">
                Powered by Skula
              </a>
            </div>
          </div>
        </div>

        {/* ── Right panel ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col relative" style={{ background: "#f1f5f9" }}>

          {/* Left accent stripe */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: color }} />

          {/* Mobile color bar */}
          <div className="lg:hidden h-1 shrink-0" style={{ background: color }} />

          {/* Mobile back link */}
          <div className="lg:hidden flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
            <a href={websiteUrl} className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </a>
            <span className="text-[13px] font-bold text-slate-700">{name}</span>
          </div>

          {/* Form center */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-14 py-12">
            <div className="w-full max-w-[420px] bg-white rounded-2xl px-8 py-9"
              style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04), 0 20px 48px rgba(0,0,0,0.08)" }}>

              {/* School identity echo on the right */}
              <div className="flex items-center gap-3 mb-8">
                {profile?.logo ? (
                  <img src={profile.logo} alt={name} className="w-9 h-9 rounded-full object-cover shrink-0"
                    style={{ boxShadow: `0 0 0 2px ${color}40` }} />
                ) : (
                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white font-black text-[13px]"
                    style={{ background: color, boxShadow: `0 4px 12px ${color}50` }}>
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-slate-800 font-bold text-[14px] leading-tight">{name}</p>
                  {location && <p className="text-slate-400 text-[11px] mt-0.5">{location}</p>}
                </div>
              </div>

              {/* Heading */}
              <div className="mb-8">
                <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-none">
                  Sign in
                </h2>
                <p className="text-slate-400 text-[14px] mt-2">
                  Enter your credentials to access the portal
                </p>
              </div>

              <SignInPage tenant={tenant} accentColor={color} />

              {/* Back link */}
              <div className="mt-8 pt-6 border-t border-slate-100">
                <a href={websiteUrl}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to {name} website
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-8 sm:px-12 lg:px-16 pb-7">
            <p className="text-[11px] text-slate-300">
              Powered by{" "}
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
                className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                Skula
              </a>
              {" · "}
              <a href="https://novalss.com" target="_blank" rel="noopener noreferrer"
                className="hover:text-slate-500 transition-colors">
                a Novalss product
              </a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Skula main domain ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left */}
      <div className="lg:w-[44%] xl:w-[40%] flex flex-col relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #0d0b1a 0%, #1e1b4b 55%, #312e81 100%)" }}>

        <div className="absolute bottom-0 left-0 right-0 h-64 pointer-events-none"
          style={{ background: "linear-gradient(to top, rgba(0,0,0,0.3), transparent)" }} />
        <div className="absolute -bottom-6 -right-4 pointer-events-none select-none font-black text-white leading-none"
          style={{ fontSize: 180, opacity: 0.05 }}>S</div>

        <div className="relative flex flex-col h-full px-10 xl:px-12 py-10 min-h-[520px] lg:min-h-0">

          {/* Logo mark */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(165,180,252,0.15)", border: "1.5px solid rgba(165,180,252,0.3)" }}>
              <GraduationCap className="h-5 w-5 text-indigo-300" />
            </div>
            <div>
              <p className="text-white font-black text-[20px] tracking-tight leading-none">Skula</p>
              <p className="text-[10px] font-bold tracking-widest uppercase mt-0.5" style={{ color: "rgba(165,180,252,0.5)" }}>
                by Novalss
              </p>
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-center py-8">
            <p className="text-[10.5px] font-bold uppercase tracking-[0.2em] mb-5"
              style={{ color: "rgba(165,180,252,0.55)" }}>
              School management platform
            </p>
            <h1 className="text-white font-black leading-[1.04] tracking-tight mb-5"
              style={{ fontSize: "clamp(32px, 3.6vw, 50px)" }}>
              Everything your<br />school needs.<br />
              <span style={{ color: "#a5b4fc" }}>One place.</span>
            </h1>
            <div className="w-10 h-[2px] rounded-full mb-6" style={{ background: "rgba(165,180,252,0.3)" }} />
            <p className="text-[14px] leading-relaxed mb-10 max-w-[280px]"
              style={{ color: "rgba(255,255,255,0.48)" }}>
              Students, fees, attendance, exams, and staff — managed from a single dashboard. Live in under 30 minutes.
            </p>
            <div className="flex gap-8">
              {[["50+", "Schools"], ["16", "Modules"], ["30m", "To go live"]].map(([n, l]) => (
                <div key={l}>
                  <p className="text-white font-black text-[26px] leading-none">{n}</p>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <p className="text-[10.5px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              getskula.com
            </p>
          </div>
        </div>
      </div>

      {/* Right */}
      <div className="flex-1 flex flex-col relative" style={{ background: "#f1f5f9" }}>
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "linear-gradient(to bottom, #6366f1, #8b5cf6)" }} />
        <div className="lg:hidden h-1 shrink-0"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }} />

        <div className="lg:hidden flex items-center gap-2.5 px-6 pt-5 pb-0 shrink-0">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          <span className="font-black text-slate-900 text-[16px]">Skula</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-14 py-12">
          <div className="w-full max-w-[420px] bg-white rounded-2xl px-8 py-9"
            style={{ boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 4px 8px rgba(0,0,0,0.04), 0 20px 48px rgba(0,0,0,0.08)" }}>

            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="text-slate-800 font-bold text-[14px] leading-tight">Skula</p>
                <p className="text-slate-400 text-[11px] mt-0.5">School Management Platform</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-[34px] font-black text-slate-900 tracking-tight leading-none">
                Sign in
              </h2>
              <p className="text-slate-400 text-[14px] mt-2">
                Access your school management dashboard
              </p>
            </div>

            <SignInPage tenant={tenant} accentColor="#6366f1" />

            <div className="mt-8 pt-6 border-t border-slate-100">
              <p className="text-[13px] text-slate-400">
                New to Skula?{" "}
                <Link href="/contact" className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
                  Get started →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-8 sm:px-12 lg:px-16 pb-7">
          <p className="text-[11px] text-slate-300">
            Powered by{" "}
            <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
              className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">Skula</a>
            {" · "}
            <a href="https://novalss.com" target="_blank" rel="noopener noreferrer"
              className="hover:text-slate-500 transition-colors">a Novalss product</a>
          </p>
        </div>
      </div>
    </div>
  );
}
