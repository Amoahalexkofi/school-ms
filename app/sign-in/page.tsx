import { headers } from "next/headers";
import { GraduationCap, ArrowLeft, ArrowUpRight } from "lucide-react";
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

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function SignInRoute() {
  const h = await headers();
  const tenantSchema = h.get("x-tenant-schema");
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  // ── School subdomain ──────────────────────────────────────────────────────────
  if (tenantSchema) {
    const { profile, tenant: tenantRow, primaryColor } = await fetchSchoolData(tenantSchema);
    const rawName    = profile?.name ?? tenantRow?.name ?? tenantSchema;
    const name       = formatName(rawName);
    const color      = primaryColor;
    const initials   = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
    const subdomain  = tenantRow?.subdomain;
    const websiteUrl = subdomain ? `https://${subdomain}.novalss.com` : "/";

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left: School identity — solid color, typography only ── */}
        <div
          className="lg:w-[42%] xl:w-[38%] flex flex-col relative"
          style={{ backgroundColor: color }}
        >
          {/* Vignette — darkens edges slightly for depth without gradients */}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.22) 100%)" }} />

          <div className="relative flex flex-col h-full px-10 xl:px-14 py-10">

            {/* Back to website */}
            <div className="shrink-0">
              <a href={websiteUrl}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold transition-colors group"
                style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.9)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
                Back to website
              </a>
            </div>

            {/* School identity — centered */}
            <div className="flex-1 flex flex-col justify-center">
              {/* Logo */}
              <div className="mb-8">
                {profile?.logo ? (
                  <img src={profile.logo} alt={name}
                    className="w-[72px] h-[72px] rounded-2xl object-cover"
                    style={{ boxShadow: "0 0 0 2px rgba(255,255,255,0.3), 0 8px 24px rgba(0,0,0,0.3)" }} />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-2xl flex items-center justify-center"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      border: "1.5px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.25)",
                    }}>
                    <span className="text-white font-black text-[26px]">{initials}</span>
                  </div>
                )}
              </div>

              {/* School name — this IS the design */}
              <h1
                className="text-white font-black leading-[1.02] tracking-tight"
                style={{ fontSize: "clamp(32px, 3.8vw, 56px)" }}
              >
                {name}
              </h1>

              {/* Hairline rule */}
              <div className="my-5 w-10 h-[1.5px]" style={{ background: "rgba(255,255,255,0.3)" }} />

              {/* Motto */}
              {profile?.motto && (
                <p className="text-[14px] italic font-medium leading-relaxed max-w-[240px]"
                  style={{ color: "rgba(255,255,255,0.58)" }}>
                  {profile.motto}
                </p>
              )}
              {!profile?.motto && (
                <p className="text-[14px] italic font-medium" style={{ color: "rgba(255,255,255,0.45)" }}>
                  Student &amp; Staff Portal
                </p>
              )}
            </div>

            {/* Powered by */}
            <div className="shrink-0">
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
                className="text-[10.5px] font-bold tracking-[0.15em] uppercase transition-colors"
                style={{ color: "rgba(255,255,255,0.28)" }}>
                Powered by Skula
              </a>
            </div>
          </div>
        </div>

        {/* ── Right: Form — pure white, uncluttered ── */}
        <div className="flex-1 flex flex-col bg-white relative">

          {/* Left accent stripe */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: color }} />

          {/* Mobile: top accent strip */}
          <div className="lg:hidden h-[3px] shrink-0" style={{ background: color }} />

          {/* Mobile back link */}
          <div className="lg:hidden flex items-center justify-between px-7 pt-6 pb-0 shrink-0">
            <a href={websiteUrl}
              className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </a>
            <span className="text-[13px] font-bold text-slate-600">{name}</span>
          </div>

          {/* Form center */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 py-12">
            <div className="w-full max-w-[380px]">

              <div className="mb-9">
                <h2 className="text-[36px] font-black text-slate-900 tracking-tight leading-none">
                  Sign in
                </h2>
                <p className="text-slate-400 text-[14px] mt-2.5 leading-relaxed">
                  Access the <span className="text-slate-600 font-semibold">{name}</span> portal
                </p>
              </div>

              <SignInPage tenant={tenant} accentColor={color} />

              <div className="mt-8 pt-7 border-t border-slate-100">
                <a href={websiteUrl}
                  className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-350 hover:text-slate-600 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to {name}
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

  // ── Skula main domain ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">

      {/* Left: Skula brand */}
      <div className="lg:w-[44%] xl:w-[40%] flex flex-col relative"
        style={{ backgroundColor: "#0f0e17" }}>

        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(99,102,241,0.08) 0%, transparent 50%, rgba(139,92,246,0.08) 100%)" }} />

        <div className="relative flex flex-col h-full px-10 xl:px-14 py-10">

          {/* Skula mark */}
          <div className="shrink-0 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 text-indigo-300" />
            </div>
            <span className="text-white font-black text-[20px] tracking-tight">Skula</span>
          </div>

          <div className="flex-1 flex flex-col justify-center">

            <p className="text-[10.5px] font-bold tracking-[0.18em] uppercase mb-6"
              style={{ color: "rgba(165,180,252,0.6)" }}>
              School management
            </p>

            <h1 className="text-white font-black leading-[1.02] tracking-tight mb-5"
              style={{ fontSize: "clamp(36px, 4vw, 58px)" }}>
              Run your school.<br />
              <span style={{ color: "#a5b4fc" }}>Not paperwork.</span>
            </h1>

            <div className="w-10 h-[1.5px] mb-7" style={{ background: "rgba(165,180,252,0.3)" }} />

            <p className="text-[14px] leading-relaxed max-w-[280px]"
              style={{ color: "rgba(255,255,255,0.45)" }}>
              Students, fees, attendance, exams — all in one place. Set up in under 30 minutes.
            </p>

            <div className="mt-10 flex gap-8">
              {[
                { n: "50+", label: "Schools" },
                { n: "16",  label: "Modules" },
                { n: "30m", label: "To go live" },
              ].map(({ n, label }) => (
                <div key={label}>
                  <p className="text-white font-black text-[28px] leading-none">{n}</p>
                  <p className="text-[11px] font-semibold mt-1" style={{ color: "rgba(255,255,255,0.35)" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="shrink-0">
            <p className="text-[10.5px] font-bold tracking-[0.15em] uppercase"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              by Novalss · getskula.com
            </p>
          </div>
        </div>
      </div>

      {/* Right: Form */}
      <div className="flex-1 flex flex-col bg-white relative">

        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "linear-gradient(to bottom, #6366f1, #8b5cf6)" }} />

        <div className="lg:hidden h-[3px] shrink-0"
          style={{ background: "linear-gradient(to right, #6366f1, #8b5cf6)" }} />

        <div className="lg:hidden flex items-center gap-2.5 px-7 pt-6 shrink-0">
          <GraduationCap className="h-5 w-5 text-indigo-500" />
          <span className="font-black text-slate-900 text-[16px]">Skula</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 lg:px-16 py-12">
          <div className="w-full max-w-[380px]">

            <div className="mb-9">
              <h2 className="text-[36px] font-black text-slate-900 tracking-tight leading-none">
                Sign in
              </h2>
              <p className="text-slate-400 text-[14px] mt-2.5">
                Access your school dashboard
              </p>
            </div>

            <SignInPage tenant={tenant} accentColor="#6366f1" />

            <div className="mt-8 pt-7 border-t border-slate-100">
              <p className="text-[13px] text-slate-400">
                New to Skula?{" "}
                <Link href="/contact"
                  className="font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
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
