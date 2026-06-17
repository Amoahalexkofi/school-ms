import { headers } from "next/headers";
import { GraduationCap, ArrowLeft, CheckCircle2, Users, DollarSign, BarChart3, MapPin, Phone, Mail, ExternalLink } from "lucide-react";
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

const ROLES = [
  { emoji: "🎓", label: "Students",    desc: "Results, fees & timetable" },
  { emoji: "👨‍👩‍👧", label: "Parents",     desc: "Track your child's progress" },
  { emoji: "👩‍🏫", label: "Teachers",    desc: "Attendance, marks & lessons" },
  { emoji: "⚙️",  label: "Admin",       desc: "Full school management" },
];

// ── School-branded left panel ────────────────────────────────────────────────
function SchoolLeftPanel({ name, initials, color, profile, websiteUrl }: {
  name: string; initials: string; color: string;
  profile: any; websiteUrl: string;
}) {
  const dark1 = darken(color, 0.52);
  const dark2 = darken(color, 0.30);
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");

  return (
    <div
      className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative flex-col overflow-hidden"
      style={{ background: `linear-gradient(160deg, ${dark1} 0%, ${dark2} 45%, ${color} 100%)` }}
    >
      {/* Decorative blobs */}
      <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.06)" }} />
      <div className="absolute -bottom-24 -left-24 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: "rgba(0,0,0,0.18)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "36px 36px" }} />

      {/* Giant watermark initial */}
      <div className="absolute bottom-6 right-4 pointer-events-none select-none font-black text-white leading-none"
        style={{ fontSize: 220, opacity: 0.045, lineHeight: 1 }}>
        {initials[0]}
      </div>

      <div className="relative flex flex-col h-full px-10 xl:px-12 py-9">

        {/* Back to website — top */}
        <div className="shrink-0">
          <a href={websiteUrl}
            className="inline-flex items-center gap-1.5 text-white/55 hover:text-white/90 text-[13px] font-semibold transition-colors group">
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
            Back to website
          </a>
        </div>

        {/* School identity — vertically centered */}
        <div className="flex-1 flex flex-col justify-center py-6 min-h-0">

          {/* Logo / avatar */}
          <div className="mb-6">
            {profile?.logo ? (
              <img src={profile.logo} alt={name}
                className="w-[88px] h-[88px] rounded-2xl object-cover"
                style={{ boxShadow: `0 0 0 3px rgba(255,255,255,0.25), 0 12px 32px rgba(0,0,0,0.35)` }} />
            ) : (
              <div className="w-[88px] h-[88px] rounded-2xl flex items-center justify-center"
                style={{
                  background: "rgba(255,255,255,0.12)",
                  border: "2px solid rgba(255,255,255,0.25)",
                  boxShadow: "0 12px 32px rgba(0,0,0,0.3)",
                }}>
                <span className="text-white font-black text-[32px] tracking-tight">{initials}</span>
              </div>
            )}
          </div>

          {/* School name */}
          <h1 className="text-white font-black leading-[1.05] tracking-tight mb-2"
            style={{ fontSize: "clamp(26px, 3vw, 42px)" }}>
            {name}
          </h1>

          {/* Motto */}
          {profile?.motto && (
            <p className="text-white/60 text-[14px] italic font-medium leading-relaxed mb-6 max-w-[260px]">
              &ldquo;{profile.motto}&rdquo;
            </p>
          )}
          {!profile?.motto && <div className="mb-6" />}

          {/* Contact chips */}
          {(location || profile?.phone || profile?.email) && (
            <div className="flex flex-col gap-2 mb-8">
              {location && (
                <div className="flex items-center gap-2.5 text-white/65 text-[13px]">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{location}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center gap-2.5 text-white/65 text-[13px]">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  {profile.phone}
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center gap-2.5 text-white/65 text-[13px]">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-full h-px mb-7" style={{ background: "rgba(255,255,255,0.12)" }} />

          {/* Portal access label */}
          <p className="text-white/35 text-[10px] font-black uppercase tracking-[0.22em] mb-4">
            Portal access
          </p>

          {/* Role tiles — 2×2 grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {ROLES.map(({ emoji, label, desc }) => (
              <div key={label}
                className="flex items-start gap-2.5 rounded-xl p-3 transition-colors hover:bg-white/10 cursor-default"
                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}>
                <span className="text-[18px] shrink-0 leading-none mt-0.5">{emoji}</span>
                <div>
                  <p className="text-white text-[12px] font-bold leading-none">{label}</p>
                  <p className="text-white/45 text-[11px] mt-1 leading-snug">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Powered by — bottom */}
        <div className="shrink-0">
          <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
            className="text-white/30 hover:text-white/60 text-[10.5px] font-semibold tracking-widest uppercase transition-colors">
            Powered by Skula
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Skula main-domain left panel ─────────────────────────────────────────────
function SkulaLeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[46%] relative flex-col overflow-hidden"
      style={{ background: "linear-gradient(160deg, #13111e 0%, #1e1b4b 45%, #312e81 75%, #4338ca 100%)" }}>

      {/* Decorative circles */}
      <div className="absolute -top-40 -right-40 w-[560px] h-[560px] rounded-full pointer-events-none"
        style={{ background: "rgba(255,255,255,0.055)" }} />
      <div className="absolute -bottom-28 -left-28 w-[420px] h-[420px] rounded-full pointer-events-none"
        style={{ background: "rgba(0,0,0,0.20)" }} />

      {/* Dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "36px 36px" }} />

      {/* Watermark S */}
      <div className="absolute bottom-4 right-2 pointer-events-none select-none font-black text-white leading-none"
        style={{ fontSize: 220, opacity: 0.04, lineHeight: 1 }}>
        S
      </div>

      <div className="relative flex flex-col h-full px-12 py-10">

        {/* Logo mark */}
        <div className="shrink-0 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center">
            <GraduationCap className="h-5.5 w-5.5 text-white" />
          </div>
          <div>
            <p className="text-white font-black text-[22px] tracking-tight leading-none">Skula</p>
            <p className="text-white/35 text-[10px] font-bold tracking-widest uppercase mt-0.5">by Novalss</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center py-8">

          <p className="text-white/40 text-[10.5px] font-black uppercase tracking-[0.22em] mb-5">
            School management platform
          </p>

          <h1 className="text-white font-black leading-[1.05] tracking-tight mb-5"
            style={{ fontSize: "clamp(32px, 3.6vw, 52px)" }}>
            Everything<br />your school<br />
            <span style={{ background: "linear-gradient(90deg, #a5b4fc, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              needs. Here.
            </span>
          </h1>

          <p className="text-white/55 text-[14px] leading-relaxed mb-10 max-w-[300px]">
            Students, fees, attendance, exams, and staff — managed from a single dashboard. Live in under 30 minutes.
          </p>

          {/* Stats row */}
          <div className="flex gap-6 mb-10">
            {[
              { value: "50+",  label: "Schools" },
              { value: "16",   label: "Modules" },
              { value: "30m",  label: "Setup time" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-white font-black text-[26px] leading-none">{value}</p>
                <p className="text-white/40 text-[11px] font-semibold mt-1">{label}</p>
              </div>
            ))}
          </div>

          {/* Feature bullets */}
          <div className="flex flex-col gap-3">
            {[
              "Fee collection with printable receipts",
              "Digital attendance + parent SMS alerts",
              "Exam marks → ranked marksheets in one click",
              "Parent portal — results, fees, timetable",
            ].map(item => (
              <div key={item} className="flex items-center gap-3 text-[13px] text-white/70">
                <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                  style={{ background: "rgba(165,180,252,0.2)", border: "1px solid rgba(165,180,252,0.3)" }}>
                  <CheckCircle2 className="h-2.5 w-2.5 text-indigo-300" />
                </div>
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <p className="text-white/25 text-[10.5px] font-semibold tracking-widest uppercase">
            Powered by Skula · getskula.com
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default async function SignInRoute() {
  const h = await headers();
  const tenantSchema = h.get("x-tenant-schema");
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  // ── School subdomain login ──────────────────────────────────────────────────
  if (tenantSchema) {
    const { profile, tenant: tenantRow, primaryColor } = await fetchSchoolData(tenantSchema);
    const rawName    = profile?.name ?? tenantRow?.name ?? tenantSchema;
    const name       = formatName(rawName);
    const color      = primaryColor;
    const initials   = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
    const subdomain  = tenantRow?.subdomain;
    const websiteUrl = subdomain ? `https://${subdomain}.novalss.com` : "/";

    return (
      <div className="min-h-screen flex">
        <SchoolLeftPanel
          name={name}
          initials={initials}
          color={color}
          profile={profile}
          websiteUrl={websiteUrl}
        />

        {/* Right panel — pure white, no nested card */}
        <div className="flex-1 flex flex-col relative bg-white">

          {/* Left accent stripe (desktop) */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: `linear-gradient(180deg, transparent 0%, ${color} 30%, ${color} 70%, transparent 100%)` }} />

          {/* Top accent bar (mobile) */}
          <div className="lg:hidden h-1 w-full shrink-0" style={{ background: color }} />

          {/* Mobile header */}
          <div className="lg:hidden shrink-0 px-6 pt-5 pb-2 flex items-center justify-between">
            <a href={websiteUrl}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </a>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-black text-[11px]"
                style={{ background: color }}>
                {initials}
              </div>
              <span className="font-black text-slate-800 text-[14px]">{name}</span>
            </div>
          </div>

          {/* Top-right subdomain hint (desktop only) */}
          {subdomain && (
            <div className="hidden lg:flex absolute top-6 right-7 items-center gap-1.5">
              <a href={websiteUrl}
                className="inline-flex items-center gap-1 text-[12px] text-slate-300 hover:text-slate-500 font-semibold transition-colors">
                {subdomain}.novalss.com
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}

          {/* Form area — vertically centered */}
          <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 py-10">
            <div className="w-full max-w-[400px]">

              {/* School identity pill */}
              <div className="hidden lg:inline-flex items-center gap-2 rounded-xl px-3.5 py-2 mb-6 text-[12px] font-bold"
                style={{
                  background: `${color}12`,
                  border: `1px solid ${color}30`,
                  color,
                }}>
                {profile?.logo
                  ? <img src={profile.logo} alt="" className="w-5 h-5 rounded object-cover" />
                  : <span className="w-5 h-5 rounded flex items-center justify-center text-white text-[9px] font-black" style={{ background: color }}>{initials}</span>
                }
                {name}
              </div>

              <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
                Welcome back
              </h2>
              <p className="text-slate-400 text-[14px] mt-1.5 mb-8 leading-relaxed">
                Sign in to access the <span className="text-slate-600 font-semibold">{name}</span> portal
              </p>

              <SignInPage tenant={tenant} accentColor={color} />

              {/* Back to website — below form */}
              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <a href={websiteUrl}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-350 hover:text-slate-600 transition-colors"
                  style={{ color: "#94a3b8" }}>
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Back to {name} website
                </a>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 px-8 pb-6 text-center">
            <p className="text-[11px] text-slate-300">
              Powered by{" "}
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
                className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
                Skula
              </a>
              {" "}·{" "}
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

  // ── Main Skula domain ─────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      <SkulaLeftPanel />

      {/* Right panel — pure white */}
      <div className="flex-1 lg:w-[54%] flex flex-col relative bg-white">

        {/* Left accent stripe */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ background: "linear-gradient(180deg, transparent 0%, #6366f1 30%, #8b5cf6 70%, transparent 100%)" }} />

        {/* Top accent bar (mobile) */}
        <div className="lg:hidden h-1 w-full shrink-0"
          style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6)" }} />

        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-2.5 px-6 pt-6 pb-0 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-[16px]">Skula</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 sm:px-12 py-10">
          <div className="w-full max-w-[400px]">

            {/* Skula identity pill */}
            <div className="hidden lg:flex items-center gap-2 mb-6">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/30">
                <GraduationCap className="h-4.5 w-4.5 text-white" />
              </div>
              <div>
                <p className="text-slate-900 font-black text-[17px] leading-none">Skula</p>
                <p className="text-slate-400 text-[11px] font-semibold leading-none mt-0.5">by Novalss</p>
              </div>
            </div>

            <h2 className="text-[32px] font-black text-slate-900 tracking-tight leading-tight">
              Welcome back
            </h2>
            <p className="text-slate-400 text-[14px] mt-1.5 mb-8 leading-relaxed">
              Sign in to your school management dashboard
            </p>

            <SignInPage tenant={tenant} accentColor="#6366f1" />

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-[13px] text-slate-400">
                New to Skula?{" "}
                <Link href="/contact"
                  className="font-bold transition-colors hover:opacity-75"
                  style={{ color: "#6366f1" }}>
                  Get started free →
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="shrink-0 px-8 pb-6 text-center">
          <p className="text-[11px] text-slate-300">
            Powered by{" "}
            <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
              className="font-semibold text-slate-400 hover:text-slate-600 transition-colors">
              Skula
            </a>
            {" "}·{" "}
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
