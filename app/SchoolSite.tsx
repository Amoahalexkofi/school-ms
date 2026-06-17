import Link from "next/link";
import {
  Phone, Mail, MapPin, Globe, MessageCircle,
  Users, UserCog, BookOpen, ArrowRight, Bell,
} from "lucide-react";
import { SchoolSiteHero } from "./SchoolSiteHero";
import { SchoolSiteNav }  from "./SchoolSiteNav";

// ── Types ─────────────────────────────────────────────────────────────────────
interface Profile {
  name: string; logo?: string | null; motto?: string | null;
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
export function SchoolSite({ profile, schoolName, slides, notices, settings, stats }: {
  profile: Profile | null; schoolName: string;
  slides: Slide[]; notices: Notice[]; settings: Settings; stats: Stats;
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

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "var(--font-plus-jakarta-sans, system-ui, sans-serif)" }}>

      {/* ── Fixed transparent-to-solid navbar ── */}
      <SchoolSiteNav
        name={name}
        logo={profile?.logo}
        initials={initials}
        color={color}
        hasNotices={activeNotices.length > 0}
      />

      {/* ── Hero (full viewport) ── */}
      <SchoolSiteHero
        slides={slides}
        schoolName={name}
        motto={profile?.motto}
        primaryColor={color}
      />

      {/* ── Notice ticker (below hero, above sections) ── */}
      {activeNotices.length > 0 && (
        <div
          className="relative overflow-hidden"
          style={{ background: color }}
        >
          <div className="flex items-center">
            {/* Label badge */}
            <div className="shrink-0 flex items-center gap-1.5 text-white text-[11px] font-black uppercase tracking-widest px-4 py-3 border-r border-white/20 bg-white/10">
              <Bell className="h-3.5 w-3.5" /> Latest
            </div>
            {/* Scrolling text */}
            <div className="overflow-hidden flex-1 py-3 px-2">
              <div className="flex whitespace-nowrap gap-16" style={{ animation: "marquee 28s linear infinite" }}>
                {[...activeNotices, ...activeNotices].map((n, i) => (
                  <span key={`${n.id}-${i}`} className="inline-flex items-center gap-2.5 text-white/90 text-[13px] font-semibold">
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
        <div className="border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-6 py-7 grid grid-cols-2 sm:grid-cols-3 gap-6">
            {([
              stats.students > 0 && { icon: Users,   value: stats.students >= 100 ? `${stats.students}+` : String(stats.students), label: "Students Enrolled" },
              stats.staff    > 0 && { icon: UserCog, value: stats.staff    >= 10  ? `${stats.staff}+`    : String(stats.staff),    label: "Teaching Staff"    },
              stats.classes  > 0 && { icon: BookOpen,value: String(stats.classes),                                                   label: "Classes / Sections" },
            ] as any[]).filter(Boolean).map(({ icon: Icon, value, label }: any) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white" style={{ background: color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[22px] font-black text-slate-900 leading-none tracking-tight">{value}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5 font-medium">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── About ── */}
      <section id="about" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* Text */}
            <div>
              <div
                className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] mb-4"
                style={{ color }}
              >
                <div className="w-8 h-px" style={{ background: color }} />
                About Us
              </div>
              <h2
                className="font-black text-slate-900 tracking-tight leading-[1.1] mb-5"
                style={{ fontSize: "clamp(26px, 3.5vw, 40px)" }}
              >
                {settings.aboutTitle ?? `Welcome to ${name}`}
              </h2>
              <p className="text-slate-600 text-[15.5px] leading-[1.75] mb-6">
                {settings.aboutText ??
                  `${name} is dedicated to providing quality education in a nurturing, inclusive environment. ` +
                  `We combine academic excellence with character development to equip every student for the future.`}
              </p>

              {profile?.motto && (
                <blockquote
                  className="border-l-[3px] pl-5 py-1 text-slate-700 text-[15px] italic font-medium mb-7"
                  style={{ borderColor: color }}
                >
                  &ldquo;{profile.motto}&rdquo;
                </blockquote>
              )}

              <div className="flex flex-wrap gap-3 mt-6">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 bg-white text-slate-700 text-[13px] font-semibold hover:border-slate-300 transition-colors">
                    <Phone className="h-3.5 w-3.5 text-slate-400" /> {profile.phone}
                  </a>
                )}
                {profile?.whatsappNumber && (
                  <a
                    href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g, "")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-white text-[13px] font-bold transition-all hover:opacity-90"
                    style={{ background: "#25D366" }}
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
                <Link
                  href="#contact"
                  className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-white text-[13px] font-bold transition-all hover:opacity-90"
                  style={{ background: color }}
                >
                  Contact Us <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <div
                className="rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center relative"
                style={{ background: `linear-gradient(135deg, ${color}e0 0%, ${color}90 100%)` }}
              >
                {profile?.logo ? (
                  <img src={profile.logo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-10 select-none">
                    <div
                      className="text-[80px] font-black leading-none tracking-tighter mb-4"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      {initials}
                    </div>
                    <p className="text-white/80 text-[16px] font-bold">{name}</p>
                    {location && <p className="text-white/50 text-[13px] mt-1">{location}</p>}
                  </div>
                )}
                {/* Decorative corner */}
                <div
                  className="absolute bottom-0 left-0 w-full h-1.5"
                  style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
                />
              </div>

              {/* Floating card — only if location or phone exists */}
              {(location || profile?.phone) && (
                <div className="absolute -bottom-5 -right-4 sm:-right-6 bg-white rounded-2xl px-5 py-4 border border-slate-100"
                  style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}>
                  {location && <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Location</p>}
                  <p className="text-[14px] font-black text-slate-900 leading-snug max-w-[160px]">
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
        <section id="notices" className="py-20 sm:py-24" style={{ background: "#f8f9fc" }}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div
                  className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] mb-3"
                  style={{ color }}
                >
                  <div className="w-8 h-px" style={{ background: color }} />
                  Announcements
                </div>
                <h2
                  className="font-black text-slate-900 tracking-tight"
                  style={{ fontSize: "clamp(22px, 3vw, 36px)" }}
                >
                  Notice Board
                </h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeNotices.slice(0, 6).map(notice => (
                <div
                  key={notice.id}
                  className={`rounded-2xl border p-5 ${NOTICE_CARD[notice.type] ?? NOTICE_CARD.info}`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ background: NOTICE_DOT[notice.type] ?? NOTICE_DOT.info }}
                    />
                    <span className="text-[10.5px] font-black uppercase tracking-widest opacity-60">
                      {NOTICE_LABEL[notice.type] ?? "Notice"}
                    </span>
                    <span className="ml-auto text-[11px] opacity-50 font-medium">
                      {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  <h3 className="font-black text-[15px] leading-snug mb-1.5">{notice.title}</h3>
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
      <section id="contact" className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em] mb-3"
              style={{ color }}
            >
              <div className="w-8 h-px" style={{ background: color }} />
              Contact Us
              <div className="w-8 h-px" style={{ background: color }} />
            </div>
            <h2 className="font-black text-slate-900 tracking-tight" style={{ fontSize: "clamp(22px, 3vw, 36px)" }}>
              Get in Touch
            </h2>
            <p className="text-slate-500 text-[15px] mt-3 max-w-md mx-auto">
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
                <div
                  key={item.label}
                  className="text-center p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all group"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 text-white transition-transform group-hover:scale-110"
                    style={{ background: color }}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-widest mb-2">{item.label}</p>
                  {item.href ? (
                    <a
                      href={item.href}
                      className="text-[14px] font-semibold text-slate-700 hover:underline break-words"
                      target={item.href.startsWith("http") ? "_blank" : undefined}
                      rel="noopener noreferrer"
                    >
                      {item.value}
                    </a>
                  ) : (
                    <p className="text-[14px] font-semibold text-slate-700 break-words leading-snug">{item.value}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center mb-14">
              <p className="text-slate-400 text-[14px]">
                Contact details not yet configured.{" "}
                <a href="/sign-in" className="font-bold hover:underline" style={{ color }}>
                  Sign in to update settings →
                </a>
              </p>
            </div>
          )}

          {/* Sign-in CTA banner */}
          <div
            className="rounded-3xl overflow-hidden relative"
            style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 100%)` }}
          >
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.07) 1px, transparent 0)", backgroundSize: "36px 36px" }}
            />
            <div className="relative px-8 py-12 sm:px-14 flex flex-col sm:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-[clamp(20px,2.5vw,30px)] font-black text-white leading-tight mb-2">
                  Ready to access your portal?
                </h3>
                <p className="text-white/70 text-[15px]">
                  Students, parents and staff — sign in to your personal dashboard.
                </p>
              </div>
              <Link
                href="/sign-in"
                className="shrink-0 inline-flex items-center gap-2 bg-white font-black px-8 py-4 rounded-2xl text-[15px] transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
                style={{ color }}
              >
                Sign In Now <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 bg-slate-50 py-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5">
            {/* School identity */}
            <div className="flex items-center gap-3">
              {profile?.logo ? (
                <img src={profile.logo} alt={name} className="w-9 h-9 rounded-xl object-cover" />
              ) : (
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-[12px] font-black"
                  style={{ background: color }}
                >
                  {initials}
                </div>
              )}
              <div>
                <p className="text-[14px] font-black text-slate-800 leading-none">{name}</p>
                {location && <p className="text-[11px] text-slate-400 mt-0.5">{location}</p>}
              </div>
            </div>

            {/* Quick links */}
            <div className="flex items-center gap-5 text-[13px] text-slate-500">
              {[["#about", "About"], ["#notices", "Notices"], ["#contact", "Contact"]].map(([href, label]) => (
                <a key={href} href={href} className="hover:text-slate-800 transition-colors font-medium">{label}</a>
              ))}
              <Link
                href="/sign-in"
                className="text-white font-bold px-4 py-2 rounded-xl transition-all hover:opacity-90 text-[12px]"
                style={{ background: color }}
              >
                Sign In
              </Link>
            </div>
          </div>

          <div className="mt-7 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-[12px] text-slate-400">
            <p>© {new Date().getFullYear()} {name}. All rights reserved.</p>
            <p>
              Powered by{" "}
              <a href="https://getskula.com" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 hover:underline">Skula</a>
              {" · "}
              <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="hover:underline">a Novalss product</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
