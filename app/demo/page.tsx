"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap, ShieldCheck, Shield, BookOpen, Wallet,
  Library, UserCircle, Users, Eye, EyeOff, ArrowRight,
  CheckCircle2, Database, Zap, RefreshCw,
} from "lucide-react";

const DEMO_PASSWORD = "Demo@Skula2026";

const ROLES = [
  { key: "superadmin", label: "Super Admin",  email: "demo@getskula.com",              icon: ShieldCheck, color: "indigo",  tags: ["All modules", "Settings", "Users"]      },
  { key: "admin",      label: "Admin",         email: "admin.demo@getskula.com",        icon: Shield,      color: "blue",    tags: ["Students", "Staff", "Reports"]          },
  { key: "teacher",    label: "Teacher",       email: "teacher.demo@getskula.com",      icon: BookOpen,    color: "emerald", tags: ["Attendance", "Marks", "Homework"]       },
  { key: "accountant", label: "Accountant",    email: "accountant.demo@getskula.com",   icon: Wallet,      color: "violet",  tags: ["Fees", "Invoices", "Receipts"]          },
  { key: "librarian",  label: "Librarian",     email: "librarian.demo@getskula.com",    icon: Library,     color: "amber",   tags: ["Books", "Issue & Return", "Members"]    },
  { key: "student",    label: "Student",       email: "student.demo@getskula.com",      icon: UserCircle,  color: "sky",     tags: ["Results", "Timetable", "Homework"]      },
  { key: "parent",     label: "Parent",        email: "parent.demo@getskula.com",       icon: Users,       color: "rose",    tags: ["Fee balance", "Attendance", "Results"]  },
] as const;

const CM: Record<string, { activeBg: string; activeRing: string; tag: string; chip: string; chipText: string; dot: string }> = {
  indigo:  { activeBg: "bg-indigo-600",  activeRing: "ring-indigo-400/40",  tag: "bg-indigo-50 text-indigo-700",   chip: "border-indigo-300/70 text-indigo-700",  chipText: "text-indigo-700",  dot: "bg-indigo-600"  },
  blue:    { activeBg: "bg-blue-600",    activeRing: "ring-blue-400/40",    tag: "bg-blue-50 text-blue-700",       chip: "border-blue-300/70 text-blue-700",      chipText: "text-blue-700",    dot: "bg-blue-600"    },
  emerald: { activeBg: "bg-emerald-600", activeRing: "ring-emerald-400/40", tag: "bg-emerald-50 text-emerald-700", chip: "border-emerald-300/70 text-emerald-700",chipText: "text-emerald-700", dot: "bg-emerald-600" },
  violet:  { activeBg: "bg-violet-600",  activeRing: "ring-violet-400/40",  tag: "bg-violet-50 text-violet-700",   chip: "border-violet-300/70 text-violet-700",  chipText: "text-violet-700",  dot: "bg-violet-600"  },
  amber:   { activeBg: "bg-amber-500",   activeRing: "ring-amber-400/40",   tag: "bg-amber-50 text-amber-700",     chip: "border-amber-300/70 text-amber-700",    chipText: "text-amber-700",   dot: "bg-amber-500"   },
  sky:     { activeBg: "bg-sky-600",     activeRing: "ring-sky-400/40",     tag: "bg-sky-50 text-sky-700",         chip: "border-sky-300/70 text-sky-700",        chipText: "text-sky-700",     dot: "bg-sky-600"     },
  rose:    { activeBg: "bg-rose-600",    activeRing: "ring-rose-400/40",    tag: "bg-rose-50 text-rose-700",       chip: "border-rose-300/70 text-rose-700",      chipText: "text-rose-700",    dot: "bg-rose-600"    },
};

type RoleKey = typeof ROLES[number]["key"];

export default function DemoPage() {
  const router  = useRouter();
  const [selected, setSelected] = useState<RoleKey | null>(null);
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const role = ROLES.find(r => r.key === selected);

  async function handleLogin() {
    if (!role) return;
    setLoading(true); setError("");
    const result = await signIn("credentials", { email: role.email, password: DEMO_PASSWORD, redirect: false });
    if (result?.error) { setError("Demo account unavailable. Try another role."); setLoading(false); }
    else { router.push("/dashboard"); router.refresh(); }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── LEFT: gradient brand panel ── */}
      <div
        className="hidden lg:flex lg:w-[44%] xl:w-[42%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}
      >
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.13) 1px, transparent 0)",
          backgroundSize: "30px 30px",
        }} />
        {/* Glow */}
        <div className="absolute -top-20 -right-20 w-[360px] h-[360px] bg-white/50 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 -left-10 w-[280px] h-[280px] bg-indigo-400/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-10 py-10">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 w-fit">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="text-slate-900 font-black text-[17px] tracking-tight">Skula</span>
          </Link>

          {/* Centre copy */}
          <div className="flex-1 flex flex-col justify-center py-10">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white/75 backdrop-blur-sm border border-indigo-300/50 text-indigo-700 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 w-fit shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              Live interactive demo
            </div>

            {/* Headline */}
            <h1 className="font-black tracking-tight leading-[1.02]" style={{ fontSize: "clamp(38px, 4vw, 52px)" }}>
              <span className="text-slate-900">See Skula</span>
              <br />
              <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                in action.
              </span>
            </h1>

            <p className="text-slate-600 text-[15px] mt-5 leading-relaxed max-w-[300px]">
              Step inside as any role — no sign-up, no card, no setup. Just the real product.
            </p>

            {/* Feature trio */}
            <div className="mt-9 space-y-4">
              {[
                { icon: Database, text: "Real data — students, fees, timetables, marks" },
                { icon: Zap,      text: "All 7 roles · full module access · no limits"   },
                { icon: RefreshCw,text: "No sign-up required. Data resets every 24 hrs." },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/65 backdrop-blur-sm border border-indigo-200/60 flex items-center justify-center shrink-0 shadow-sm">
                    <Icon className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-slate-600 text-[13.5px] leading-snug">{text}</p>
                </div>
              ))}
            </div>

            {/* Role chips */}
            <div className="mt-10 flex flex-wrap gap-2">
              {ROLES.map(r => {
                const c = CM[r.color];
                const Icon = r.icon;
                return (
                  <span
                    key={r.key}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/65 backdrop-blur-sm border ${c.chip} text-[11.5px] font-semibold shadow-sm`}
                  >
                    <Icon className="h-3 w-3" />
                    {r.label}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 pt-7 border-t border-indigo-200/60">
            <p className="text-slate-500 text-[12.5px]">
              Want your own school on Skula?{" "}
              <Link href="/contact" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                Talk to us →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: role selector ── */}
      <div className="flex-1 flex flex-col bg-[#f4f5fb] overflow-y-auto">

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
        <div className="flex-1 flex flex-col justify-center p-5 md:p-8">
          <div
            className="max-w-[580px] mx-auto w-full bg-white rounded-[28px] overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(99,102,241,0.09), 0 24px 56px rgba(0,0,0,0.09), 0 56px 96px rgba(99,102,241,0.05)" }}
          >
            {/* Card top accent */}
            <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)" }} />

            <div className="px-7 pt-7 pb-8 md:px-9 md:pt-8 md:pb-9">

              {/* Heading */}
              <div className="mb-7">
                <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Pick a role</h2>
                <p className="text-[13.5px] text-slate-500 mt-1.5 leading-snug">
                  Credentials fill automatically — just click{" "}
                  <strong className="text-slate-700 font-semibold">Login</strong> to enter.
                </p>
              </div>

              {/* Role grid */}
              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const c = CM[r.color];
                  const isActive = selected === r.key;
                  return (
                    <button
                      key={r.key}
                      type="button"
                      onClick={() => { setSelected(r.key); setError(""); setShowPw(false); }}
                      className={`group relative flex items-start gap-3 p-3.5 rounded-2xl border text-left transition-all duration-150 outline-none ${
                        isActive
                          ? `bg-white border-slate-300 ring-2 ${c.activeRing}`
                          : "bg-slate-50 border-slate-200 hover:bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                      style={isActive ? { boxShadow: "0 2px 14px rgba(0,0,0,0.07)" } : undefined}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive ? c.activeBg : "bg-white border border-slate-200 group-hover:border-slate-300"
                      }`}>
                        <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-slate-500"}`} />
                      </div>

                      {/* Label + tags */}
                      <div className="min-w-0 flex-1 mt-0.5">
                        <p className={`text-[13px] font-bold leading-tight mb-1.5 ${isActive ? "text-slate-900" : "text-slate-700"}`}>
                          {r.label}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map(tag => (
                            <span
                              key={tag}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                                isActive ? c.tag : "bg-slate-100 text-slate-500"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0 mt-0.5 absolute top-3.5 right-3.5" />}
                    </button>
                  );
                })}
              </div>

              {/* Credential reveal */}
              <div className={`transition-all duration-300 overflow-hidden ${role ? "opacity-100 max-h-[420px] mb-5" : "opacity-0 max-h-0"}`}>
                {role && (() => {
                  const c = CM[role.color];
                  const Icon = role.icon;
                  return (
                    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
                      {/* Role indicator bar */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-slate-200 bg-white">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.activeBg}`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-[13px] font-bold text-slate-900">Signing in as {role.label}</p>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
                            <input
                              type="email" readOnly value={role.email}
                              className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 text-[11.5px] font-mono text-slate-700 focus:outline-none cursor-default select-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                              <input
                                type={showPw ? "text" : "password"} readOnly value={DEMO_PASSWORD}
                                className="w-full h-9 rounded-lg border border-slate-200 bg-white px-3 pr-9 text-[11.5px] font-mono text-slate-700 focus:outline-none cursor-default"
                              />
                              <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
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
                          type="button" onClick={handleLogin} disabled={loading}
                          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-60 text-white font-bold h-11 rounded-xl transition-colors text-[14px]"
                          style={{ boxShadow: "0 2px 10px rgba(99,102,241,0.40), 0 1px 3px rgba(0,0,0,0.08)" }}
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
                    </div>
                  );
                })()}
              </div>

              {/* Empty state hint */}
              {!role && (
                <p className="text-center text-[12.5px] text-slate-400 py-1 mb-5">
                  Select a role above to see pre-filled credentials.
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-center gap-5 pt-5 border-t border-slate-100 text-[12.5px] text-slate-400">
                <Link href="/" className="hover:text-slate-600 transition-colors">← Homepage</Link>
                <span className="text-slate-200">|</span>
                <Link href="/contact" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  Get your own school →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
