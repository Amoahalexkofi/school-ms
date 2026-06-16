"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap, ShieldCheck, Shield, BookOpen, Wallet,
  Library, UserCircle, Users, Eye, EyeOff, ArrowRight,
  CheckCircle2, Sparkles, Database, Clock,
} from "lucide-react";

const DEMO_PASSWORD = "Demo@Skula2026";

const ROLES = [
  {
    key: "superadmin",
    label: "Super Admin",
    email: "demo@getskula.com",
    icon: ShieldCheck,
    color: "indigo",
    tags: ["All modules", "Settings", "User management"],
  },
  {
    key: "admin",
    label: "Admin",
    email: "admin.demo@getskula.com",
    icon: Shield,
    color: "blue",
    tags: ["Students", "Staff", "Reports"],
  },
  {
    key: "teacher",
    label: "Teacher",
    email: "teacher.demo@getskula.com",
    icon: BookOpen,
    color: "emerald",
    tags: ["Attendance", "Marks", "Homework"],
  },
  {
    key: "accountant",
    label: "Accountant",
    email: "accountant.demo@getskula.com",
    icon: Wallet,
    color: "violet",
    tags: ["Fees", "Invoices", "Receipts"],
  },
  {
    key: "librarian",
    label: "Librarian",
    email: "librarian.demo@getskula.com",
    icon: Library,
    color: "amber",
    tags: ["Books", "Issue & Return", "Members"],
  },
  {
    key: "student",
    label: "Student",
    email: "student.demo@getskula.com",
    icon: UserCircle,
    color: "sky",
    tags: ["Results", "Timetable", "Homework"],
  },
  {
    key: "parent",
    label: "Parent",
    email: "parent.demo@getskula.com",
    icon: Users,
    color: "rose",
    tags: ["Fee balance", "Attendance", "Results"],
  },
] as const;

const COLOR_MAP: Record<string, { iconBg: string; iconText: string; iconActiveBg: string; tag: string; ring: string; border: string; chip: string; chipText: string }> = {
  indigo: { iconBg: "bg-indigo-500/20", iconText: "text-indigo-600", iconActiveBg: "bg-indigo-500", tag: "bg-indigo-500/10 text-indigo-700", ring: "ring-indigo-400/50", border: "border-indigo-400/60", chip: "bg-white/60 border-indigo-300/60", chipText: "text-indigo-700" },
  blue:   { iconBg: "bg-blue-500/20",   iconText: "text-blue-600",   iconActiveBg: "bg-blue-500",   tag: "bg-blue-500/10 text-blue-700",   ring: "ring-blue-400/50",   border: "border-blue-400/60",   chip: "bg-white/60 border-blue-300/60",   chipText: "text-blue-700"   },
  emerald:{ iconBg: "bg-emerald-500/20",iconText: "text-emerald-600",iconActiveBg: "bg-emerald-500",tag: "bg-emerald-500/10 text-emerald-700",ring: "ring-emerald-400/50",border: "border-emerald-400/60",chip: "bg-white/60 border-emerald-300/60",chipText: "text-emerald-700"},
  violet: { iconBg: "bg-violet-500/20", iconText: "text-violet-600", iconActiveBg: "bg-violet-500", tag: "bg-violet-500/10 text-violet-700", ring: "ring-violet-400/50", border: "border-violet-400/60", chip: "bg-white/60 border-violet-300/60", chipText: "text-violet-700" },
  amber:  { iconBg: "bg-amber-500/20",  iconText: "text-amber-600",  iconActiveBg: "bg-amber-500",  tag: "bg-amber-500/10 text-amber-700",  ring: "ring-amber-400/50",  border: "border-amber-400/60",  chip: "bg-white/60 border-amber-300/60",  chipText: "text-amber-700"  },
  sky:    { iconBg: "bg-sky-500/20",    iconText: "text-sky-600",    iconActiveBg: "bg-sky-500",    tag: "bg-sky-500/10 text-sky-700",    ring: "ring-sky-400/50",    border: "border-sky-400/60",    chip: "bg-white/60 border-sky-300/60",    chipText: "text-sky-700"    },
  rose:   { iconBg: "bg-rose-500/20",   iconText: "text-rose-600",   iconActiveBg: "bg-rose-500",   tag: "bg-rose-500/10 text-rose-700",   ring: "ring-rose-400/50",   border: "border-rose-400/60",   chip: "bg-white/60 border-rose-300/60",   chipText: "text-rose-700"   },
};

type RoleKey = typeof ROLES[number]["key"];

const FEATURES = [
  { icon: Database, text: "Real data — students, fees, timetables, marks" },
  { icon: Sparkles, text: "All 7 roles, full module access, no restrictions" },
  { icon: Clock,    text: "No sign-up required. Data resets daily." },
];

export default function DemoPage() {
  const router  = useRouter();
  const [selected, setSelected] = useState<RoleKey | null>(null);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const role = ROLES.find(r => r.key === selected);

  async function handleLogin() {
    if (!role) return;
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email: role.email,
      password: DEMO_PASSWORD,
      redirect: false,
    });
    if (result?.error) {
      setError("Demo account unavailable. Try another role.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left: homepage gradient panel ── */}
      <div
        className="hidden lg:flex lg:w-[42%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}
      >
        {/* Dot grid texture */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Soft white highlight top-right */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/40 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo-300/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-10 py-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="text-slate-900 font-black text-[16px] tracking-tight">Skula</span>
          </Link>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 bg-white/70 border border-indigo-300/60 text-indigo-700 text-[11px] font-bold px-3 py-1.5 rounded-full mb-5 w-fit backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              Live interactive demo
            </div>

            <h1 className="text-[30px] font-black text-slate-900 leading-[1.1] tracking-tight">
              See Skula<br />
              <span className="text-indigo-600">in action.</span>
            </h1>
            <p className="text-slate-600 text-[14px] mt-4 leading-relaxed max-w-xs">
              Step inside the system as any role. No sign-up, no card, no setup — just the real product.
            </p>

            {/* Feature list */}
            <div className="mt-8 space-y-3.5">
              {FEATURES.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-white/60 border border-indigo-200/60 backdrop-blur-sm flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-slate-600 text-[13px] leading-snug pt-1">{text}</p>
                </div>
              ))}
            </div>

            {/* Role count chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              {ROLES.map(r => {
                const c = COLOR_MAP[r.color];
                const Icon = r.icon;
                return (
                  <div key={r.key} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${c.chip} ${c.chipText} text-[11px] font-semibold backdrop-blur-sm shadow-sm`}>
                    <Icon className="h-3 w-3" />
                    {r.label}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="shrink-0 pt-8 border-t border-indigo-200/60">
            <p className="text-slate-500 text-[12px]">
              Want your own school on Skula?{" "}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Talk to us →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: role selection panel ── */}
      <div className="flex-1 flex flex-col bg-slate-50/80 overflow-y-auto">

        {/* Mobile nav */}
        <div className="lg:hidden flex items-center justify-between px-6 py-4 bg-white border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-black text-slate-900 text-[15px]">Skula</span>
          </Link>
          <Link href="/" className="text-[12px] text-slate-400 hover:text-slate-600 transition-colors">← Back</Link>
        </div>

        {/* Floating card */}
        <div className="flex-1 flex flex-col justify-center px-6 md:px-10 py-10">
          <div
            className="max-w-2xl mx-auto w-full bg-white rounded-3xl px-7 py-8 md:px-10 md:py-10"
            style={{
              boxShadow:
                "0 1px 2px rgba(0,0,0,0.04), 0 4px 16px rgba(99,102,241,0.08), 0 16px 48px rgba(0,0,0,0.08), 0 40px 80px rgba(99,102,241,0.06)",
            }}
          >
            {/* Heading */}
            <div className="mb-7">
              <h2 className="text-[24px] font-black text-slate-900 tracking-tight">Pick a role</h2>
              <p className="text-[13px] text-slate-500 mt-1">
                Credentials will fill automatically. Just click <strong className="text-slate-700 font-semibold">Login</strong> to enter.
              </p>
            </div>

            {/* Role grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6">
              {ROLES.map((r) => {
                const Icon = r.icon;
                const c = COLOR_MAP[r.color];
                const isActive = selected === r.key;
                return (
                  <button
                    key={r.key}
                    type="button"
                    onClick={() => { setSelected(r.key); setError(""); setShowPw(false); }}
                    className={`group relative flex items-start gap-3.5 p-4 rounded-xl border text-left transition-all duration-150 ${
                      isActive
                        ? "bg-white border-slate-300 shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-2 " + c.ring
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                      isActive ? c.iconActiveBg : "bg-slate-100 group-hover:bg-slate-200"
                    }`}>
                      <Icon className={`h-[18px] w-[18px] transition-colors ${isActive ? "text-white" : "text-slate-500"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-[13px] font-bold leading-tight ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                        {r.label}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {r.tags.map(tag => (
                          <span key={tag} className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                            isActive ? c.tag : "bg-slate-100 text-slate-500"
                          }`}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    {isActive && (
                      <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Credential form */}
            <div className={`transition-all duration-300 overflow-hidden ${role ? "opacity-100 max-h-[400px]" : "opacity-0 max-h-0"}`}>
              {role && (
                <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-center gap-2 mb-4">
                    {(() => {
                      const c = COLOR_MAP[role.color];
                      const Icon = role.icon;
                      return (
                        <>
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.iconActiveBg}`}>
                            <Icon className="h-3.5 w-3.5 text-white" />
                          </div>
                          <p className="text-[13px] font-bold text-slate-900">Signing in as {role.label}</p>
                        </>
                      );
                    })()}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                      <input
                        type="email"
                        readOnly
                        value={role.email}
                        className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[12px] font-mono text-slate-700 focus:outline-none cursor-default select-all"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                      <div className="relative">
                        <input
                          type={showPw ? "text" : "password"}
                          readOnly
                          value={DEMO_PASSWORD}
                          className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[12px] font-mono text-slate-700 focus:outline-none cursor-default"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPw(s => !s)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                          tabIndex={-1}
                        >
                          {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                      {error}
                    </p>
                  )}

                  <button
                    type="button"
                    onClick={handleLogin}
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold h-11 rounded-xl transition-colors text-[14px] shadow-[0_2px_8px_rgba(99,102,241,0.4)]"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                        Signing in…
                      </>
                    ) : (
                      <>Login as {role.label} <ArrowRight className="h-4 w-4" /></>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Prompt when nothing selected */}
            {!role && (
              <p className="text-center text-[12px] text-slate-400 py-2">
                Select a role above to see the pre-filled credentials.
              </p>
            )}

            {/* Footer links */}
            <div className="flex items-center justify-center gap-5 mt-8 pt-6 border-t border-slate-100 text-[12px] text-slate-400">
              <Link href="/" className="hover:text-slate-600 transition-colors">← Homepage</Link>
              <span>·</span>
              <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">
                Get your own school →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
