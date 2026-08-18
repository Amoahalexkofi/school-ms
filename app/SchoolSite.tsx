import Link from "next/link";
import {
  Phone, Mail, MapPin, Globe, MessageCircle,
  Users, UserCog, BookOpen, ArrowRight, Bell,
} from "lucide-react";
import { SchoolSiteHero } from "./SchoolSiteHero";
import { SchoolSiteNav }  from "./SchoolSiteNav";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  name: string; logo?: string | null; coverImage?: string | null; motto?: string | null;
  address?: string | null; phone?: string | null; email?: string | null;
  website?: string | null; city?: string | null; state?: string | null;
  country?: string | null; whatsappNumber?: string | null; code?: string | null;
}
interface Slide   { id: string; title: string; subtitle?: string | null; imageUrl?: string | null; ctaText: string; ctaLink: string; }
interface Notice  { id: string; title: string; body?: string | null; type: string; isActive?: boolean; createdAt: string; }
interface Settings { aboutTitle?: string | null; aboutText?: string | null; primaryColor: string; showStats: boolean; }
interface Stats   { students: number; staff: number; classes: number; }

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatName(raw: string): string {
  // If it looks like a raw subdomain (all lowercase alphanumeric/hyphen), title-case it
  if (/^[a-z0-9-_]+$/.test(raw)) return raw.replace(/[-_]/g, " ").replace(/\b\w/g, c => c.toUpperCase());
  return raw;
}

const NOTICE_CARD: Record<string, string> = {
  urgent:  "bg-red-50    border-red-200    text-red-800",
  warning: "bg-amber-50  border-amber-200  text-amber-800",
  info:    "bg-blue-50   border-blue-200   text-blue-800",
};
const NOTICE_DOT: Record<string, string> = {
  urgent: "#ef4444", warning: "#f59e0b", info: "#3b82f6",
};
const NOTICE_LABEL: Record<string, string> = {
  urgent: "Urgent", warning: "Important", info: "Notice",
};

// ── Component ─────────────────────────────────────────────────────────────────
export function SchoolSite({ profile, schoolName, slides, notices, settings, stats, preview = false }: {
  profile: Profile | null; schoolName: string;
  slides: Slide[]; notices: Notice[]; settings: Settings; stats: Stats; preview?: boolean;
}) {
  const rawName = profile?.name ?? schoolName;
  const name    = formatName(rawName);
  const color   = settings.primaryColor || "#6366f1";

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join("");

  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");

  const activeNotices = notices.filter(n => n.isActive !== false);

  const contactItems = [
    profile?.address && { icon: MapPin, label: "Address", value: profile.address, href: undefined },
    profile?.phone   && { icon: Phone,  label: "Phone",   value: profile.phone,   href: `tel:${profile.phone}` },
    profile?.email   && { icon: Mail,   label: "Email",   value: profile.email,   href: `mailto:${profile.email}` },
    profile?.website && { icon: Globe,  label: "Website", value: profile.website.replace(/^https?:\/\//, ""), href: profile.website },
  ].filter(Boolean) as { icon: any; label: string; value: string; href?: string }[];

  const totalStats = stats.students + stats.staff + stats.classes;
  const showStats  = settings.showStats && totalStats > 0;

  // Deep, brand-coherent tone for dark bands (CTA banner) — derived from the
  // school's own accent, same technique as the hero fallback.
  const deepTone = `color-mix(in srgb, ${color} 80%, #0d1424)`;

  return (
    <div className="min-h-screen bg-white text-[#0d253d] overflow-x-hidden" style={{ fontFamily: "var(--font-plus-jakarta-sans, system-ui, sans-serif)" }}>

      {preview && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[80] flex items-center gap-3 bg-[#0d253d] text-white text-[12.5px] px-4 py-2.5 rounded-full" style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
          <span className="opacity-90">Previewing your public website</span>
          <Link href="/dashboard" className="font-semibold underline underline-offset-2 hover:text-white/80">Back to dashboard</Link>
        </div>
      )}

      {/* ── Fixed transparent-to-solid navbar ── */}
      <SchoolSiteNav
        name={name}
        logo={profile?.logo}
        initials={initials}
        color={color}
        hasNotices={activeNotices.length > 0}
      />

      {/* ── Hero (near-full viewport) ── */}
      <SchoolSiteHero
        slides={slides}
        schoolName={name}
        motto={profile?.motto}
        primaryColor={color}
      />

      {/* ── Notice ticker (below hero, above sections) ── */}
      {activeNotices.length > 0 && (
        <div className="relative overflow-hidden border-b border-[#e3e8ee]" style={{ background: color }}>
          <div className="flex items-center">
            <div className="shrink-0 flex items-center gap-1.5 text-white text-[10.5px] font-bold uppercase tracking-widest px-4 py-2.5 border-r border-white/20 bg-white/10">
              <Bell className="h-3.5 w-3.5" /> Latest
            </div>
            <div className="overflow-hidden flex-1 py-2.5 px-2">
              <div className="flex whitespace-nowrap gap-16" style={{ animation: "marquee 28s linear infinite" }}>
                {[...activeNotices, ...activeNotices].map((n, i) => (
                  <span key={`${n.id}-${i}`} className="inline-flex items-center gap-2.5 text-white/90 text-[13px] font-medium">
                    <span className="w-1 h-1 rounded-full bg-white/50 shrink-0" />
                    {n.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats strip ── */}
      {showStats && (
        <div className="border-b border-[#e3e8ee]">
          <div className="max-w-6xl mx-auto px-6 py-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {([
              stats.students > 0 && { icon: Users,   value: stats.students >= 100 ? `${stats.students}+` : String(stats.students), label: "Students Enrolled" },
              stats.staff    > 0 && { icon: UserCog, value: stats.staff    >= 10  ? `${stats.staff}+`    : String(stats.staff),    label: "Teaching Staff"    },
              stats.classes  > 0 && { icon: BookOpen,value: String(stats.classes),                                                   label: "Classes / Sections" },
            ] as any[]).filter(Boolean).map(({ icon: Icon, value, label }: any) => (
              <div key={label} className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: color }}>
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <div>
                  <p className="text-[20px] font-semibold text-[#0d253d] leading-none tracking-tight" style={{ fontFeatureSettings: '"tnum"' }}>{value}</p>
                  <p className="text-[12px] text-[#64748d] mt-1">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── About ── */}
      <section id="about" className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Text */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-4" style={{ color }}>
                About Us
              </p>
              <h2 className="font-light text-[#0d253d] tracking-[-0.02em] leading-[1.12] mb-5" style={{ fontSize: "clamp(26px, 3.2vw, 38px)" }}>
                {settings.aboutTitle ?? `Welcome to ${name}`}
              </h2>
              <p className="text-[#64748d] text-[15px] leading-[1.75] mb-6">
                {settings.aboutText ??
                  `${name} is dedicated to providing quality education in a nurturing, inclusive environment. ` +
                  `We combine academic excellence with character development to equip every student for the future.`}
              </p>

              {profile?.motto && (
                <blockquote className="border-l-2 pl-5 py-1 text-[#273951] text-[15px] italic mb-7" style={{ borderColor: color }}>
                  &ldquo;{profile.motto}&rdquo;
                </blockquote>
              )}

              <div className="flex flex-wrap gap-2.5 mt-6">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full border border-[#e3e8ee] bg-white text-[#273951] text-[13px] font-medium hover:border-[#d5dde6] transition-colors">
                    <Phone className="h-3.5 w-3.5 text-[#64748d]" /> {profile.phone}
                  </a>
                )}
                {profile?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-white text-[13px] font-medium transition-all hover:brightness-105"
                    style={{ background: "#25D366" }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-full text-white text-[13px] font-medium transition-all hover:brightness-105"
                  style={{ background: color }}
                >
                  Contact Us <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div
                className="rounded-2xl overflow-hidden aspect-[4/3] flex items-center justify-center relative border border-[#e3e8ee]"
                style={{ background: `linear-gradient(135deg, ${color}e6 0%, ${color}b3 100%)` }}
              >
                {profile?.coverImage ? (
                  <img src={profile.coverImage} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-10 select-none">
                    <div className="text-[72px] font-light leading-none tracking-tighter mb-4" style={{ color: "rgba(255,255,255,0.22)" }}>
                      {initials}
                    </div>
                    <p className="text-white/85 text-[15px] font-medium">{name}</p>
                    {location && <p className="text-white/55 text-[13px] mt-1">{location}</p>}
                  </div>
                )}
              </div>

              {/* Floating card — only if location or phone exists */}
              {(location || profile?.phone) && (
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl px-5 py-4 border border-[#e3e8ee]"
                  style={{ boxShadow: `0 8px 28px ${color}26` }}>
                  {location && <p className="text-[10.5px] font-bold text-[#64748d] uppercase tracking-widest mb-1">Location</p>}
                  <p className="text-[13.5px] font-semibold text-[#0d253d] leading-snug max-w-[160px]">
                    {profile?.address ?? location}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Notice board ── */}
      {activeNotices.length > 0 && (
        <section id="notices" className="py-16 sm:py-20 bg-[#f6f9fc] border-t border-[#e3e8ee]">
          <div className="max-w-6xl mx-auto px-6">
            <div className="mb-10">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color }}>
                Announcements
              </p>
              <h2 className="font-light text-[#0d253d] tracking-[-0.02em]" style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}>
                Notice Board
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeNotices.slice(0, 6).map(notice => (
                <div key={notice.id} className={`rounded-2xl border p-5 ${NOTICE_CARD[notice.type] ?? NOTICE_CARD.info}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-2 h-2 rounded-full shrink-0" style={{ background: NOTICE_DOT[notice.type] ?? NOTICE_DOT.info }} />
                    <span className="text-[10.5px] font-bold uppercase tracking-widest opacity-60">
                      {NOTICE_LABEL[notice.type] ?? "Notice"}
                    </span>
                    <span className="ml-auto text-[11px] opacity-50 font-medium">
                      {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[14.5px] leading-snug mb-1.5">{notice.title}</h3>
                  {notice.body && (
                    <p className="text-[13px] opacity-70 leading-relaxed line-clamp-3">{notice.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section id="contact" className="py-16 sm:py-24 bg-white border-t border-[#e3e8ee]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] mb-3" style={{ color }}>
              Contact Us
            </p>
            <h2 className="font-light text-[#0d253d] tracking-[-0.02em]" style={{ fontSize: "clamp(22px, 2.8vw, 32px)" }}>
              Get in Touch
            </h2>
            <p className="text-[#64748d] text-[15px] mt-3 max-w-md mx-auto">
              We&apos;d love to hear from you. Reach out through any of the channels below.
            </p>
          </div>

          {contactItems.length > 0 ? (
            <div className={`grid gap-4 max-w-4xl mx-auto mb-14 ${
              contactItems.length === 1 ? "grid-cols-1 max-w-xs" :
              contactItems.length === 2 ? "sm:grid-cols-2 max-w-2xl" :
              contactItems.length === 3 ? "sm:grid-cols-3 max-w-3xl" :
              "sm:grid-cols-2 lg:grid-cols-4"
            }`}>
              {contactItems.map(item => (
                <div key={item.label} className="text-center p-6 rounded-2xl border border-[#e3e8ee] hover:border-[#d5dde6] transition-colors" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4 text-white" style={{ background: color }}>
                    <item.icon className="h-4.5 w-4.5" />
                  </div>
                  <p className="text-[10.5px] font-bold text-[#64748d] uppercase tracking-widest mb-2">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-[13.5px] font-medium text-[#273951] hover:underline break-words"
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-[13.5px] font-medium text-[#273951] break-words leading-snug">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-14">
              <p className="text-[#94a3b8] text-[14px]">
                Contact details not yet configured.{" "}
                <a href="/sign-in" className="font-semibold hover:underline" style={{ color }}>
                  Sign in to update settings →
                </a>
              </p>
            </div>
          )}

          {/* Sign-in CTA banner */}
          <div className="rounded-2xl px-8 py-12 sm:px-14 flex flex-col sm:flex-row items-center justify-between gap-6" style={{ background: deepTone }}>
            <div>
              <h3 className="font-light text-white tracking-[-0.02em] leading-tight mb-2" style={{ fontSize: "clamp(20px, 2.4vw, 28px)" }}>
                Ready to access your portal?
              </h3>
              <p className="text-white/65 text-[14.5px]">
                Students, parents and staff — sign in to your personal dashboard.
              </p>
            </div>
            <Link
              href="/sign-in"
              className="shrink-0 inline-flex items-center gap-2 bg-white font-medium px-7 py-3.5 rounded-full text-[14.5px] transition-all hover:brightness-95 active:scale-[0.98] whitespace-nowrap"
              style={{ color: "#0d253d" }}
            >
              Sign In Now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-[#e3e8ee] bg-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* School identity */}
            <div className="flex items-center gap-3">
              {profile?.logo ? (
                <img src={profile.logo} alt={name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-bold" style={{ background: color }}>
                  {initials}
                </div>
              )}
              <div>
                <p className="text-[13.5px] font-semibold text-[#0d253d] leading-none">{name}</p>
                {location && <p className="text-[11px] text-[#94a3b8] mt-1">{location}</p>}
              </div>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-4 text-[13px] text-[#64748d]">
              {[["#about", "About"], ["#notices", "Notices"], ["#contact", "Contact"]].map(([href, label]) => (
                <a key={href} href={href} className="hover:text-[#0d253d] transition-colors font-medium">{label}</a>
              ))}
              <Link href="/sign-in" className="text-white font-medium px-4 py-2 rounded-full transition-all hover:brightness-105 text-[12.5px]" style={{ background: color }}>
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-[#f1f5f9] flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-[#94a3b8]">
            <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer" className="font-semibold text-[#64748d] hover:underline">Skula</a>
              {" · "}
              <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="hover:underline">a Novalss product</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
