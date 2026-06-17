import { headers } from "next/headers";
import { GraduationCap, ArrowLeft, CheckCircle2, Users, DollarSign, BarChart3, ArrowRight, MapPin, Phone, Mail } from "lucide-react";
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

// ── School-branded login left panel ─────────────────────────────────────────
function SchoolLoginPanel({ name, initials, color, profile, websiteUrl }: {
  name: string; initials: string; color: string;
  profile: any; websiteUrl: string;
}) {
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");

  return (
    <div
      className="hidden lg:flex lg:w-[48%] relative flex-col overflow-hidden"
      style={{ background: `linear-gradient(135deg, ${color}ee 0%, ${color}aa 60%, ${color}70 100%)` }}
    >
      {/* Subtle dot grid */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      {/* Radial glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 70% at 50% 110%, rgba(255,255,255,0.15) 0%, transparent 70%)" }} />

      <div className="relative flex flex-col h-full px-12 py-10">

        {/* Back to website */}
        <div className="shrink-0">
          <a href={websiteUrl}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-[13px] font-semibold transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to website
          </a>
        </div>

        {/* School identity — centered vertically */}
        <div className="flex-1 flex flex-col justify-center">

          {/* Logo / avatar */}
          <div className="mb-8">
            {profile?.logo ? (
              <img src={profile.logo} alt={name} className="w-20 h-20 rounded-2xl object-cover shadow-xl shadow-black/20" />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-white/20 border border-white/30 backdrop-blur-sm flex items-center justify-center shadow-xl shadow-black/10">
                <span className="text-white font-black text-[28px] tracking-tight">{initials}</span>
              </div>
            )}
          </div>

          {/* Name + motto */}
          <h1 className="text-white font-black text-[clamp(24px,3vw,36px)] leading-tight tracking-tight mb-3">
            {name}
          </h1>
          {profile?.motto && (
            <p className="text-white/70 text-[15px] italic font-medium mb-8 leading-relaxed">
              &ldquo;{profile.motto}&rdquo;
            </p>
          )}
          {!profile?.motto && <div className="mb-8" />}

          {/* Contact snippets */}
          <div className="space-y-3 mb-10">
            {location && (
              <div className="flex items-center gap-3 text-white/75 text-[14px]">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <MapPin className="h-3.5 w-3.5 text-white" />
                </div>
                {location}
              </div>
            )}
            {profile?.phone && (
              <div className="flex items-center gap-3 text-white/75 text-[14px]">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-white" />
                </div>
                {profile.phone}
              </div>
            )}
            {profile?.email && (
              <div className="flex items-center gap-3 text-white/75 text-[14px]">
                <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
                  <Mail className="h-3.5 w-3.5 text-white" />
                </div>
                {profile.email}
              </div>
            )}
          </div>

          {/* Who can sign in */}
          <div className="bg-white/10 border border-white/20 rounded-2xl p-5 backdrop-blur-sm">
            <p className="text-white/60 text-[10.5px] font-black uppercase tracking-[0.18em] mb-4">Portal Access</p>
            <div className="space-y-3">
              {[
                { icon: "🎓", role: "Students",       desc: "Results, attendance, fees & timetable" },
                { icon: "👪", role: "Parents",        desc: "Track your child's progress" },
                { icon: "👩‍🏫", role: "Staff / Admin", desc: "Full school management dashboard" },
              ].map(({ icon, role, desc }) => (
                <div key={role} className="flex items-center gap-3">
                  <span className="text-[18px] shrink-0">{icon}</span>
                  <div>
                    <p className="text-white text-[13px] font-bold leading-none">{role}</p>
                    <p className="text-white/55 text-[11.5px] mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Powered by footer */}
        <div className="shrink-0 pt-6">
          <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
            className="text-white/40 hover:text-white/70 text-[11px] font-semibold tracking-widest uppercase transition-colors">
            Powered by Skula
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Skula generic left panel (main domain) ────────────────────────────────────
function SkulaLoginPanel() {
  return (
    <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden border-r border-indigo-200/50"
      style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}>

      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

      <div className="relative flex flex-col h-full px-14 py-12">
        <div className="flex items-center gap-4 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-300/50">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <div>
            <span className="text-slate-900 font-black text-[32px] tracking-tight leading-none">Skula</span>
            <p className="text-indigo-500 text-[11px] font-bold tracking-widest uppercase mt-0.5">by Novalss</p>
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-center">
          <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6">School Management Platform</p>
          <h1 className="text-[42px] font-black text-slate-900 leading-[1.08] tracking-tight mb-5">
            Everything your<br />school needs.<br />
            <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              One place.
            </span>
          </h1>
          <p className="text-slate-600 text-[15px] leading-relaxed mb-10 max-w-sm">
            Students, fees, attendance, exams, staff — managed from one dashboard. Live in under 30 minutes.
          </p>
          <div className="grid grid-cols-3 gap-3 mb-10">
            {[
              { icon: Users,      value: "50+",  label: "Schools",      color: "text-indigo-600"  },
              { icon: DollarSign, value: "98%",  label: "Fee accuracy", color: "text-emerald-600" },
              { icon: BarChart3,  value: "3hrs", label: "Saved / week", color: "text-violet-600"  },
            ].map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="bg-white/70 border border-white/90 rounded-2xl p-4 backdrop-blur-sm shadow-sm">
                <Icon className={`h-5 w-5 ${color} mb-3`} />
                <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
                <p className="text-slate-500 text-[11px] font-medium mt-1.5">{label}</p>
              </div>
            ))}
          </div>
          <ul className="space-y-3.5">
            {["Fee collection with instant printable receipts", "Digital attendance with parent SMS alerts", "Exam marks → ranked marksheets in one click", "Parent portal — results, fees, timetable"].map(item => (
              <li key={item} className="flex items-center gap-3 text-[14px] font-medium text-slate-700">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                </div>
                {item}
              </li>
            ))}
          </ul>
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

  // School subdomain — fetch branding
  if (tenantSchema) {
    const { profile, tenant: tenantRow, primaryColor } = await fetchSchoolData(tenantSchema);
    const rawName   = profile?.name ?? tenantRow?.name ?? tenantSchema;
    const name      = formatName(rawName);
    const color     = primaryColor;
    const initials  = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
    const subdomain = tenantRow?.subdomain;
    const websiteUrl = subdomain
      ? `https://${subdomain}.novalss.com`
      : "/";

    return (
      <div className="min-h-screen flex">
        <SchoolLoginPanel
          name={name}
          initials={initials}
          color={color}
          profile={profile}
          websiteUrl={websiteUrl}
        />

        {/* Right panel — login form */}
        <div className="flex-1 flex flex-col relative"
          style={{ background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)" }}>

          {/* Dot grid */}
          <div className="absolute inset-0 pointer-events-none opacity-40"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)", backgroundSize: "24px 24px" }} />

          {/* Mobile back link */}
          <div className="relative lg:hidden flex items-center justify-between px-6 pt-6 pb-0">
            <a href={websiteUrl}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-500 hover:text-slate-800 transition-colors">
              <ArrowLeft className="h-3.5 w-3.5" /> Back to website
            </a>
          </div>

          {/* Mobile logo */}
          <div className="relative lg:hidden flex items-center gap-3 px-6 pt-4 pb-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-black" style={{ background: color }}>
              {initials}
            </div>
            <span className="font-black text-gray-900 text-[16px]">{name}</span>
          </div>

          <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-10">
            <div className="w-full max-w-[420px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/80 px-9 py-10">

              {/* School avatar (small, in form card) */}
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6 shadow-lg text-white font-black text-[16px]"
                style={{ background: color, boxShadow: `0 8px 24px ${color}40` }}
              >
                {profile?.logo
                  ? <img src={profile.logo} alt={name} className="w-full h-full object-cover rounded-2xl" />
                  : initials}
              </div>

              <h2 className="text-[26px] font-black text-gray-900 tracking-tight leading-tight">Welcome back</h2>
              <p className="text-gray-400 text-[14px] mt-1.5 mb-7">Sign in to {name} portal</p>

              <SignInPage tenant={tenant} />

              <div className="mt-7 pt-6 border-t border-gray-100 text-center">
                <a href={websiteUrl}
                  className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-slate-400 hover:text-slate-700 transition-colors">
                  <ArrowLeft className="h-3.5 w-3.5" /> Back to {name} website
                </a>
              </div>
            </div>
          </div>

          <div className="relative shrink-0 px-8 pb-6 text-center">
            <p className="text-[11px] text-gray-400">
              Powered by <span className="font-semibold text-gray-500">Skula</span>{" "}·{" "}
              <a href="https://novalss.com" className="hover:underline">a Novalss product</a>
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Main Skula domain — generic login ────────────────────────────────────────
  return (
    <div className="min-h-screen flex">
      <SkulaLoginPanel />

      <div className="lg:w-1/2 flex-1 flex flex-col relative"
        style={{ background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)" }}>

        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)", backgroundSize: "24px 24px" }} />
        <div className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, transparent 0%, #6366f1 30%, #8b5cf6 70%, transparent 100%)" }} />

        <div className="relative lg:hidden flex items-center gap-2.5 px-8 pt-8 pb-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-gray-900">Skula</span>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/80 px-10 py-12">
            <div className="flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center mb-8 shadow-lg shadow-indigo-300/40">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <h2 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Welcome back</h2>
            <p className="text-gray-400 text-[14px] mt-2 mb-8">Sign in to your school dashboard</p>
            <SignInPage tenant={tenant} />
            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-[13px] text-gray-400">
                New to Skula?{" "}
                <Link href="/contact" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center gap-1">
                  Get started free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        <div className="relative shrink-0 px-8 pb-8 text-center">
          <p className="text-[11px] text-gray-400">
            Powered by <span className="font-semibold text-gray-500">Skula</span>{" "}·{" "}
            <a href="https://novalss.com" className="hover:underline">a Novalss product</a>
          </p>
        </div>
      </div>
    </div>
  );
}
