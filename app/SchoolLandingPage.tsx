import Link from "next/link";
import { GraduationCap, MapPin, Phone, Mail, Globe, ArrowRight } from "lucide-react";

interface SchoolProfile {
  name: string;
  logo?: string | null;
  motto?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
}

export function SchoolLandingPage({ profile, schoolName }: {
  profile: SchoolProfile | null;
  schoolName: string;
}) {
  const name = profile?.name ?? schoolName;
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join("");

  const location = [profile?.city, profile?.state, profile?.country]
    .filter(Boolean).join(", ");

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}>

      {/* Blobs */}
      <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
      <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)" }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

      {/* Card */}
      <div className="relative w-full max-w-[440px] mx-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl border border-white/90 px-10 py-12 text-center"
          style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 12px 40px rgba(99,102,241,0.12), 0 40px 80px rgba(0,0,0,0.08)" }}>

          {/* Logo or initials avatar */}
          {profile?.logo ? (
            <img src={profile.logo} alt={name} className="w-20 h-20 rounded-2xl object-cover mx-auto mb-6 shadow-lg" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-300/40">
              <span className="text-white font-black text-2xl tracking-tight">{initials}</span>
            </div>
          )}

          {/* School name */}
          <h1 className="text-[26px] font-black text-slate-900 tracking-tight leading-tight mb-2">
            {name}
          </h1>

          {/* Motto */}
          {profile?.motto && (
            <p className="text-[13px] text-indigo-600 font-semibold italic mb-5">
              &ldquo;{profile.motto}&rdquo;
            </p>
          )}

          {/* Contact details */}
          {(location || profile?.phone || profile?.email) && (
            <div className="space-y-2 mb-8 mt-4">
              {location && (
                <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span>{location}</span>
                </div>
              )}
              {profile?.phone && (
                <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <a href={`tel:${profile.phone}`} className="hover:text-indigo-600 transition-colors">{profile.phone}</a>
                </div>
              )}
              {profile?.email && (
                <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <a href={`mailto:${profile.email}`} className="hover:text-indigo-600 transition-colors">{profile.email}</a>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center justify-center gap-2 text-[13px] text-slate-500">
                  <Globe className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 transition-colors">{profile.website.replace(/^https?:\/\//, "")}</a>
                </div>
              )}
            </div>
          )}

          {/* Divider */}
          <div className="w-12 h-px bg-slate-200 mx-auto mb-8" />

          {/* Sign in button */}
          <Link href="/sign-in"
            className="inline-flex items-center justify-center gap-2.5 w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-2xl transition-colors text-[15px]"
            style={{ boxShadow: "0 1px 6px rgba(99,102,241,0.35), 0 4px 16px rgba(99,102,241,0.2)" }}>
            Sign In to Dashboard
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>

          <p className="text-[12px] text-slate-400 mt-4">
            Staff, admin and parent portal
          </p>
        </div>

        {/* Powered by */}
        <div className="flex items-center justify-center gap-2 mt-6">
          <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-3 w-3 text-white" />
          </div>
          <p className="text-[12px] text-slate-500">
            Powered by <span className="font-bold text-slate-700">Skula</span>
            <span className="text-slate-400"> · a Novalss product</span>
          </p>
        </div>
      </div>
    </div>
  );
}
