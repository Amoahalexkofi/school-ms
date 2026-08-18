import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ArrowLeft, Phone, Mail } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";
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
    const initials  = name.split(/\s+/).filter(Boolean).slice(0, 2).map((w: string) => w[0].toUpperCase()).join("");
    const subdomain = tenantRow?.subdomain;
    const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN?.split(",")[0]?.trim() ?? "getskula.com";
    const websiteUrl = subdomain ? `https://${subdomain}.${appDomain}` : "/";
    const location  = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");
    const year      = profile?.established ?? profile?.foundedYear ?? null;
    const hasPhoto  = !!profile?.coverImage;

    return (
      <div className="min-h-screen flex flex-col lg:flex-row">

        {/* ── Left panel ─────────────────────────────────────────────────── */}
        <div
          className="lg:w-[44%] xl:w-[40%] flex flex-col relative overflow-hidden"
          style={
            hasPhoto
              ? { backgroundImage: `url(${profile.coverImage})`, backgroundSize: "cover", backgroundPosition: "center" }
              : { background: `linear-gradient(160deg, color-mix(in srgb, ${color} 65%, #0d1424) 0%, color-mix(in srgb, ${color} 25%, #0d1424) 100%)` }
          }
        >
          {/* Legibility wash — a real photo needs a much stronger bottom
              gradient than the flat color treatment to keep overlaid text
              readable regardless of what's in the shot. */}
          <div className="absolute inset-0 pointer-events-none"
            style={{
              background: hasPhoto
                ? "linear-gradient(180deg, rgba(13,20,36,0.1) 0%, rgba(13,20,36,0.25) 45%, rgba(13,20,36,0.92) 100%)"
                : "linear-gradient(to top, rgba(0,0,0,0.45), transparent)",
            }} />

          {/* Large decorative initial — bottom right, very faint. Only for
              the flat-color fallback; a real photo doesn't need it. */}
          {!hasPhoto && (
            <div className="absolute -bottom-6 -right-4 pointer-events-none select-none font-light text-white leading-none"
              style={{ fontSize: 180, opacity: 0.06 }}>
              {initials[0] ?? "S"}
            </div>
          )}

          <div className={`relative flex flex-col h-full px-10 xl:px-12 py-10 min-h-[520px] lg:min-h-0 ${hasPhoto ? "justify-end" : ""}`}>

            {/* Back to website */}
            <div className={`shrink-0 ${hasPhoto ? "absolute top-10 xl:top-12 left-10 xl:left-12" : ""}`}>
              <a href={websiteUrl} className="inline-flex items-center gap-2 text-white/75 hover:text-white text-[13px] font-semibold transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to website
              </a>
            </div>

            {/* Main identity block */}
            <div className={hasPhoto ? "shrink-0 pt-8" : "flex-1 flex flex-col justify-center py-8"}>

              {/* Logo — skipped over a real photo; the school's own image
                  already carries the identity, a floating circle competes
                  with it instead of reinforcing it. */}
              {!hasPhoto && (
                <div className="mb-7">
                  {profile?.logo ? (
                    <img src={profile.logo} alt={name}
                      className="w-24 h-24 rounded-full object-cover"
                      style={{ boxShadow: "0 0 0 3px rgba(255,255,255,0.25)" }} />
                  ) : (
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center"
                      style={{
                        background: "rgba(255,255,255,0.14)",
                        border: "1px solid rgba(255,255,255,0.28)",
                      }}
                    >
                      <span className="text-white font-light text-[34px] tracking-tight">{initials}</span>
                    </div>
                  )}
                </div>
              )}

              {hasPhoto && (
                <p className="text-white/70 text-[11px] font-bold uppercase tracking-[0.18em] mb-3">{name}</p>
              )}

              {/* Name */}
              <h1 className="text-white font-light tracking-[-0.02em] leading-[1.1] mb-1"
                style={{ fontSize: hasPhoto ? "clamp(26px, 2.8vw, 38px)" : "clamp(28px, 3.2vw, 44px)" }}>
                {hasPhoto ? (profile?.motto || "Excellence in education.") : name}
              </h1>

              {/* Year + location */}
              {(year || location) && (
                <p className="text-white/72 text-[13px] font-medium mb-5">
                  {year ? `Est. ${year}` : ""}
                  {year && location ? "  ·  " : ""}
                  {location}
                </p>
              )}

              {/* Divider */}
              <div className="w-12 h-[2px] rounded-full mb-5" style={{ background: "rgba(255,255,255,0.3)" }} />

              {/* Motto — in photo mode it's already the headline above, so
                  this becomes a simple tagline instead of repeating it. */}
              {hasPhoto ? (
                <p className="text-white/68 text-[13px] leading-relaxed mb-7">
                  Student &amp; Staff Portal
                </p>
              ) : profile?.motto ? (
                <p className="text-white/80 text-[14px] italic leading-relaxed mb-7 max-w-[260px]">
                  &ldquo;{profile.motto}&rdquo;
                </p>
              ) : (
                <p className="text-white/68 text-[13px] leading-relaxed mb-7">
                  Student &amp; Staff Portal
                </p>
              )}

              {/* Contact details */}
              {(profile?.phone || profile?.email) && (
                <div className="space-y-2.5">
                  {profile?.phone && (
                    <div className="flex items-center gap-2.5 text-white/72 text-[13px]">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)" }}>
                        <Phone className="h-3 w-3 text-white/85" />
                      </div>
                      {profile.phone}
                    </div>
                  )}
                  {profile?.email && (
                    <div className="flex items-center gap-2.5 text-white/72 text-[13px]">
                      <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                        style={{ background: "rgba(255,255,255,0.12)" }}>
                        <Mail className="h-3 w-3 text-white/85" />
                      </div>
                      {profile.email}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Portal access row */}
            <div className="shrink-0 mb-6">
              <p className="text-white/55 text-[10px] font-bold uppercase tracking-[0.18em] mb-3">Portal access for</p>
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
                className="text-white/45 hover:text-white/75 text-[10.5px] font-bold tracking-[0.15em] uppercase transition-colors">
                Powered by Skula
              </a>
            </div>
          </div>
        </div>

        {/* ── Right panel ────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col relative" style={{ background: "#f6f9fc" }}>

          {/* Left accent stripe */}
          <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-[3px]"
            style={{ background: color }} />

          {/* Mobile color bar */}
          <div className="lg:hidden h-1 shrink-0" style={{ background: color }} />

          {/* Mobile back link */}
          <div className="lg:hidden flex items-center justify-between px-6 pt-5 pb-0 shrink-0">
            <a href={websiteUrl} className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#94a3b8] hover:text-[#0d253d] transition-colors">
              <ArrowLeft className="h-3 w-3" /> Back
            </a>
            <span className="text-[13px] font-semibold text-[#0d253d]">{name}</span>
          </div>

          {/* Form center */}
          <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 lg:px-14 py-12">
            <div className="w-full max-w-[580px] bg-white rounded-3xl border border-[#e3e8ee] px-12 py-14"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

              {/* Eyebrow */}
              <p className="text-center text-[11px] font-bold uppercase tracking-[0.18em] mb-6" style={{ color }}>
                Sign in
              </p>

              {/* School identity echo on the right */}
              <div className="flex flex-col items-center text-center gap-3 mb-8">
                {profile?.logo ? (
                  <img src={profile.logo} alt={name} className="w-14 h-14 rounded-full object-cover shrink-0"
                    style={{ boxShadow: `0 0 0 2px ${color}30` }} />
                ) : (
                  <div className="w-14 h-14 rounded-full flex items-center justify-center shrink-0 text-white font-medium text-[17px]"
                    style={{ background: color }}>
                    {initials}
                  </div>
                )}
                <div>
                  <p className="text-[#0d253d] font-semibold text-[16px] leading-tight">{name}</p>
                  {location && <p className="text-[#94a3b8] text-[12.5px] mt-0.5">{location}</p>}
                </div>
              </div>

              {/* Heading */}
              <div className="text-center mb-9">
                <h2 className="text-[36px] font-light text-[#0d253d] tracking-[-0.02em] leading-none">
                  Welcome back
                </h2>
                <p className="text-[#64748d] text-[15px] mt-3">
                  Sign in to your {name} portal
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

  // No tenant — main domain. Send visitors to the homepage.
  redirect("/");
}
