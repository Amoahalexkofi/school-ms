import Link from "next/link";
import {
  GraduationCap, Phone, Mail, MapPin, Globe, MessageCircle,
  Users, UserCog, BookOpen, Calendar, Info, Bell, ArrowRight,
} from "lucide-react";
import { SchoolSiteHero } from "./SchoolSiteHero";

interface Profile {
  name: string; logo?: string | null; motto?: string | null;
  address?: string | null; phone?: string | null; email?: string | null;
  website?: string | null; city?: string | null; state?: string | null;
  country?: string | null; whatsappNumber?: string | null;
  code?: string | null;
}
interface Slide {
  id: string; title: string; subtitle?: string | null;
  imageUrl?: string | null; ctaText: string; ctaLink: string;
}
interface Notice {
  id: string; title: string; body?: string | null;
  type: string; isActive?: boolean; createdAt: string;
}
interface Settings {
  aboutTitle?: string | null; aboutText?: string | null;
  primaryColor: string; showStats: boolean;
}
interface Stats { students: number; staff: number; classes: number; }

const TYPE_STYLES: Record<string, string> = {
  urgent:  "bg-red-50    border-red-200    text-red-700",
  warning: "bg-amber-50  border-amber-200  text-amber-700",
  info:    "bg-indigo-50 border-indigo-200 text-indigo-700",
};
const TYPE_DOT: Record<string, string> = {
  urgent: "bg-red-500", warning: "bg-amber-400", info: "bg-indigo-500",
};

export async function SchoolSite({
  profile, schoolName, slides, notices, settings, stats,
}: {
  profile: Profile | null;
  schoolName: string;
  slides: Slide[];
  notices: Notice[];
  settings: Settings;
  stats: Stats;
}) {
  const name    = profile?.name ?? schoolName;
  const color   = settings.primaryColor ?? "#6366f1";
  const location = [profile?.city, profile?.state, profile?.country].filter(Boolean).join(", ");

  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2)
    .map(w => w[0].toUpperCase()).join("");

  const activeNotices = notices.filter(n => n.isActive !== false);

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* ── Top bar ── */}
      <div className="hidden md:block text-white text-[12px]" style={{ background: color }}>
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between">
          <div className="flex items-center gap-6">
            {profile?.phone && (
              <a href={`tel:${profile.phone}`} className="flex items-center gap-1.5 opacity-90 hover:opacity-100">
                <Phone className="h-3 w-3" /> {profile.phone}
              </a>
            )}
            {profile?.email && (
              <a href={`mailto:${profile.email}`} className="flex items-center gap-1.5 opacity-90 hover:opacity-100">
                <Mail className="h-3 w-3" /> {profile.email}
              </a>
            )}
          </div>
          {profile?.motto && (
            <p className="italic opacity-80 text-[11px]">&ldquo;{profile.motto}&rdquo;</p>
          )}
          <a href="https://getskula.com" target="_blank" rel="noopener noreferrer"
            className="opacity-70 hover:opacity-100 transition-opacity text-[10px] font-semibold tracking-widest uppercase">
            Powered by Skula
          </a>
        </div>
      </div>

      {/* ── Navbar ── */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100"
        style={{ boxShadow: "0 1px 0 #e2e8f0, 0 2px 12px rgba(0,0,0,0.04)" }}>
        <div className="max-w-7xl mx-auto px-6 flex items-center h-16 gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            {profile?.logo ? (
              <img src={profile.logo} alt={name} className="w-10 h-10 rounded-xl object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[14px] shrink-0"
                style={{ background: color }}>
                {initials}
              </div>
            )}
            <span className="font-black text-slate-900 text-[15px] leading-tight tracking-tight hidden sm:block">
              {name}
            </span>
          </Link>

          {/* Nav links */}
          <div className="hidden lg:flex items-center gap-1 flex-1">
            {[
              ["#home",    "Home"],
              ["#about",   "About"],
              ["#notices", "Notices"],
              ["#contact", "Contact"],
            ].map(([href, label]) => (
              <a key={href} href={href}
                className="px-3.5 py-2 rounded-lg text-[13px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors">
                {label}
              </a>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-3">
            <Link href="/sign-in"
              className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-xl text-white font-bold text-[13px] transition-all hover:opacity-90"
              style={{ background: color }}>
              Sign In
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <SchoolSiteHero
        slides={slides}
        schoolName={name}
        motto={profile?.motto}
        primaryColor={color}
      />

      {/* ── Notice ticker ── */}
      {activeNotices.length > 0 && (
        <div className="relative overflow-hidden py-3 text-white text-[13px] font-semibold" style={{ background: color }}>
          <div className="flex items-center gap-3 px-4">
            <span className="shrink-0 flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-widest">
              <Bell className="h-3 w-3" /> Notices
            </span>
            <div className="overflow-hidden flex-1">
              <div className="flex gap-12 animate-[marquee_30s_linear_infinite] whitespace-nowrap">
                {[...activeNotices, ...activeNotices].map((n, i) => (
                  <span key={`${n.id}-${i}`} className="inline-flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    {n.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Stats strip ── */}
      {settings.showStats && (
        <div className="border-b border-slate-100 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: Users,    value: stats.students > 0 ? `${stats.students}+` : "—", label: "Students Enrolled" },
              { icon: UserCog,  value: stats.staff    > 0 ? `${stats.staff}+`    : "—", label: "Teaching Staff"    },
              { icon: BookOpen, value: stats.classes  > 0 ? `${stats.classes}`   : "—", label: "Classes / Sections" },
              { icon: Calendar, value: "Mon–Fri",                                         label: "School Days"       },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 text-white"
                  style={{ background: color }}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[22px] font-black text-slate-900 leading-none">{value}</p>
                  <p className="text-[12px] text-slate-500 mt-0.5">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── About ── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] mb-4"
                style={{ color }}>
                <div className="w-6 h-px" style={{ background: color }} />
                About Us
              </div>
              <h2 className="text-[clamp(28px,3.5vw,40px)] font-black text-slate-900 tracking-tight leading-tight mb-5">
                {settings.aboutTitle ?? `Welcome to ${name}`}
              </h2>
              <p className="text-slate-600 text-[15.5px] leading-relaxed mb-6">
                {settings.aboutText ??
                  `${name} is committed to providing quality education in a nurturing environment. ` +
                  `We combine academic excellence with character development to prepare students for the challenges of tomorrow.`}
              </p>
              {profile?.motto && (
                <blockquote className="border-l-4 pl-5 py-1 italic text-slate-700 text-[15px]"
                  style={{ borderColor: color }}>
                  &ldquo;{profile.motto}&rdquo;
                </blockquote>
              )}
              <div className="mt-8 flex flex-wrap gap-3">
                {profile?.phone && (
                  <a href={`tel:${profile.phone}`}
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-slate-200 text-slate-700 text-[13px] font-semibold hover:border-slate-300 transition-colors">
                    <Phone className="h-3.5 w-3.5" /> {profile.phone}
                  </a>
                )}
                {profile?.whatsappNumber && (
                  <a href={`https://wa.me/${profile.whatsappNumber.replace(/\D/g,"")}`}
                    target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-4 rounded-xl text-white text-[13px] font-semibold transition-all hover:opacity-90"
                    style={{ background: "#25D366" }}>
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Visual card */}
            <div className="relative">
              <div className="rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center text-white"
                style={{ background: `linear-gradient(135deg, ${color}dd, ${color}80)` }}>
                {profile?.logo ? (
                  <img src={profile.logo} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-12">
                    <div className="text-[72px] font-black leading-none tracking-tight opacity-30 mb-4">{initials}</div>
                    <p className="text-white/70 text-[15px] font-semibold">{name}</p>
                    {profile?.city && <p className="text-white/50 text-[13px] mt-1">{location}</p>}
                  </div>
                )}
              </div>
              {/* Floating badge */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl px-5 py-4 shadow-xl border border-slate-100">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">School Code</p>
                <p className="text-[20px] font-black text-slate-900">{profile?.code ?? "—"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Notices board ── */}
      {activeNotices.length > 0 && (
        <section id="notices" className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] mb-3"
                  style={{ color }}>
                  <div className="w-6 h-px" style={{ background: color }} />
                  Notice Board
                </div>
                <h2 className="text-[clamp(24px,3vw,36px)] font-black text-slate-900 tracking-tight">
                  Latest Announcements
                </h2>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {activeNotices.slice(0, 6).map(notice => (
                <div key={notice.id}
                  className={`rounded-2xl border p-5 ${TYPE_STYLES[notice.type] ?? TYPE_STYLES.info}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-2 h-2 rounded-full ${TYPE_DOT[notice.type] ?? TYPE_DOT.info}`} />
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70">
                      {notice.type === "urgent" ? "Urgent" : notice.type === "warning" ? "Important" : "Notice"}
                    </span>
                    <span className="ml-auto text-[11px] opacity-50">
                      {new Date(notice.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                  <h3 className="font-black text-[15px] leading-snug mb-1">{notice.title}</h3>
                  {notice.body && (
                    <p className="text-[13px] opacity-75 leading-relaxed line-clamp-3">{notice.body}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Contact ── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.15em] mb-3"
              style={{ color }}>
              <div className="w-6 h-px" style={{ background: color }} />
              Contact Us
              <div className="w-6 h-px" style={{ background: color }} />
            </div>
            <h2 className="text-[clamp(24px,3vw,36px)] font-black text-slate-900 tracking-tight">
              Get in Touch
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
            {[
              location && { icon: MapPin, label: "Address", value: profile?.address ?? location, href: undefined },
              profile?.phone && { icon: Phone, label: "Phone", value: profile.phone, href: `tel:${profile.phone}` },
              profile?.email && { icon: Mail, label: "Email", value: profile.email, href: `mailto:${profile.email}` },
              profile?.website && { icon: Globe, label: "Website", value: profile.website.replace(/^https?:\/\//, ""), href: profile.website },
            ].filter(Boolean).map((item: any) => (
              <div key={item.label} className="text-center p-6 rounded-2xl border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 text-white"
                  style={{ background: color }}>
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="text-[14px] font-semibold text-slate-700 hover:underline break-words" target={item.href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
                    {item.value}
                  </a>
                ) : (
                  <p className="text-[14px] font-semibold text-slate-700 break-words">{item.value}</p>
                )}
              </div>
            ))}
          </div>

          {/* Sign in CTA */}
          <div className="mt-16 rounded-3xl p-10 text-center text-white"
            style={{ background: `linear-gradient(135deg, ${color}, ${color}cc)` }}>
            <h3 className="text-[clamp(22px,2.5vw,32px)] font-black mb-2">Ready to access your portal?</h3>
            <p className="text-white/70 mb-7 text-[15px]">Students, parents and staff — sign in to your dashboard.</p>
            <Link href="/sign-in"
              className="inline-flex items-center gap-2 bg-white font-bold px-8 py-4 rounded-2xl transition-all hover:scale-105 text-[15px]"
              style={{ color }}>
              Sign In to Dashboard <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-100 py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {profile?.logo ? (
              <img src={profile.logo} alt={name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-[11px] font-black" style={{ background: color }}>
                {initials}
              </div>
            )}
            <span className="text-[13px] font-black text-slate-700">{name}</span>
          </div>
          <p className="text-[12px] text-slate-400">
            {location && <span>{location} · </span>}
            Powered by{" "}
            <a href="https://getskula.com" target="_blank" rel="noopener noreferrer" className="font-bold text-slate-600 hover:underline">
              Skula
            </a>
            {" "}·{" "}
            <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="hover:underline">
              a Novalss product
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
