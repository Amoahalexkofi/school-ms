"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  ShieldCheck, Shield, BookOpen, Wallet,
  Library, UserCircle, Users, Eye, EyeOff, ArrowRight,
  CheckCircle2, Database, Zap, RefreshCw, ConciergeBell, ChevronRight,
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
  { key: "receptionist", label: "Receptionist", email: "receptionist.demo@getskula.com", icon: ConciergeBell, color: "teal", tags: ["Visitors", "Phone calls", "Front desk"] },
] as const;

const CM: Record<string, { activeBg: string; activeRing: string; tag: string; chip: string; chipText: string; dot: string }> = {
  indigo:  { activeBg: "bg-[#533afd]",  activeRing: "ring-indigo-400/40",  tag: "bg-indigo-50 text-[#4434d4]",   chip: "border-indigo-300/70 text-[#4434d4]",  chipText: "text-[#4434d4]",  dot: "bg-[#533afd]"  },
  blue:    { activeBg: "bg-blue-600",    activeRing: "ring-blue-400/40",    tag: "bg-blue-50 text-blue-700",       chip: "border-blue-300/70 text-blue-700",      chipText: "text-blue-700",    dot: "bg-blue-600"    },
  emerald: { activeBg: "bg-emerald-600", activeRing: "ring-emerald-400/40", tag: "bg-emerald-50 text-emerald-700", chip: "border-emerald-300/70 text-emerald-700",chipText: "text-emerald-700", dot: "bg-emerald-600" },
  violet:  { activeBg: "bg-violet-600",  activeRing: "ring-violet-400/40",  tag: "bg-violet-50 text-violet-700",   chip: "border-violet-300/70 text-violet-700",  chipText: "text-violet-700",  dot: "bg-violet-600"  },
  amber:   { activeBg: "bg-amber-500",   activeRing: "ring-amber-400/40",   tag: "bg-amber-50 text-amber-700",     chip: "border-amber-300/70 text-amber-700",    chipText: "text-amber-700",   dot: "bg-amber-500"   },
  sky:     { activeBg: "bg-sky-600",     activeRing: "ring-sky-400/40",     tag: "bg-sky-50 text-sky-700",         chip: "border-sky-300/70 text-sky-700",        chipText: "text-sky-700",     dot: "bg-sky-600"     },
  rose:    { activeBg: "bg-rose-600",    activeRing: "ring-rose-400/40",    tag: "bg-rose-50 text-rose-700",       chip: "border-rose-300/70 text-rose-700",      chipText: "text-rose-700",    dot: "bg-rose-600"    },
  teal:    { activeBg: "bg-teal-600",    activeRing: "ring-teal-400/40",    tag: "bg-teal-50 text-teal-700",       chip: "border-teal-300/70 text-teal-700",      chipText: "text-teal-700",    dot: "bg-teal-600"    },
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
        style={{
          background: [
            "radial-gradient(110% 70% at 90% 0%, rgba(83,58,253,0.28) 0%, transparent 55%)",
            "radial-gradient(70% 55% at 100% 55%, rgba(234,34,97,0.13) 0%, transparent 55%)",
            "radial-gradient(85% 70% at 15% 0%, rgba(245,233,212,0.9) 0%, transparent 65%)",
            "radial-gradient(90% 80% at 0% 45%, rgba(185,185,249,0.42) 0%, transparent 60%)",
            "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
          ].join(", "),
        }}
      >

        <div className="relative flex flex-col h-full px-10 py-10">

          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0 w-fit">
            <img src="/images/skula-logomark.png" alt="Skula" className="h-10 object-contain" />
          </Link>

          {/* Centre copy */}
          <div className="flex-1 flex flex-col justify-center py-10">

            {/* Live badge */}
            <div className="inline-flex items-center gap-2 bg-white/75 backdrop-blur-sm border border-indigo-300/50 text-[#4434d4] text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 w-fit shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full animate-pulse" />
              Live interactive demo
            </div>

            {/* Headline */}
            <h1 className="font-light tracking-[-0.02em] leading-[1.04]" style={{ fontSize: "clamp(38px, 4vw, 52px)" }}>
              <span className="text-[#0d253d]">See Skula</span>
              <br />
              <span className="text-[#533afd]">in action.</span>
            </h1>

            <p className="text-[#273951] text-[15px] mt-5 leading-relaxed max-w-[300px]">
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
                    <Icon className="h-3.5 w-3.5 text-[#533afd]" />
                  </div>
                  <p className="text-[#273951] text-[13.5px] leading-snug">{text}</p>
                </div>
              ))}
            </div>

            {/* Worth trying first — concrete flows, not a second role picker */}
            <div className="mt-10 bg-white/80 border border-[#e3e8ee] rounded-2xl p-5 max-w-[400px]">
              <p className="text-[10.5px] font-semibold text-[#64748d] uppercase tracking-[0.15em] mb-3.5">Worth trying first</p>
              <div className="space-y-3">
                {[
                  ["Collect a fee", "a WhatsApp receipt fires instantly"],
                  ["Enter SBA marks", "the GES report card builds itself"],
                  ["Mark attendance", "absent parents get an SMS"],
                ].map(([action, result]) => (
                  <div key={action} className="flex items-start gap-2.5">
                    <ChevronRight className="h-3.5 w-3.5 text-[#533afd] shrink-0 mt-0.5" />
                    <p className="text-[13px] leading-snug text-[#273951]">
                      <span className="font-semibold text-[#0d253d]">{action}</span> — {result}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 pt-7 border-t border-indigo-200/60">
            <p className="text-[#64748d] text-[12.5px]">
              Want your own school on Skula?{" "}
              <Link href="/contact" className="text-[#533afd] font-semibold hover:text-[#4434d4] transition-colors">
                Talk to us →
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT: role selector ── */}
      <div className="flex-1 flex flex-col bg-[#f4f5fb] overflow-y-auto">

        {/* Mobile nav */}
        <div className="lg:hidden flex items-center justify-between px-5 py-3.5 bg-white border-b border-[#e3e8ee] sticky top-0 z-10">
          <Link href="/">
            <img src="/images/skula-logomark.png" alt="Skula" className="h-8 object-contain" />
          </Link>
          <Link href="/" className="text-[12px] font-semibold text-[#64748d] hover:text-[#273951] transition-colors">← Back</Link>
        </div>

        {/* Mobile context banner — replaces the hidden left panel */}
        <div className="lg:hidden px-5 pt-5 pb-4">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-[#4434d4] text-[11px] font-bold px-3 py-1.5 rounded-full mb-3">
            <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full animate-pulse" />
            Live interactive demo
          </div>
          <h1 className="text-[24px] font-light text-[#0d253d] tracking-[-0.01em] leading-tight mb-1">
            Try Skula. <span className="text-[#533afd]">No sign‑up.</span>
          </h1>
          <p className="text-[#64748d] text-[13px] leading-relaxed">
            Pick a role, credentials fill automatically — just tap Login.
          </p>
        </div>

        {/* Floating card */}
        <div className="flex-1 flex flex-col justify-center p-5 md:p-8">
          <div
            className="max-w-[580px] mx-auto w-full bg-white rounded-[28px] overflow-hidden"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 6px 20px rgba(83,58,253,0.09), 0 24px 56px rgba(0,0,0,0.09), 0 56px 96px rgba(83,58,253,0.05)" }}
          >
            {/* Card top accent */}

            <div className="px-7 pt-7 pb-8 md:px-9 md:pt-8 md:pb-9">

              {/* Heading */}
              <div className="mb-7">
                <h2 className="text-[28px] font-light text-[#0d253d] tracking-[-0.01em] leading-tight">Pick a role</h2>
                <p className="text-[13.5px] text-[#64748d] mt-1.5 leading-snug">
                  Credentials fill automatically — just click{" "}
                  <strong className="text-[#273951] font-semibold">Login</strong> to enter.
                </p>
              </div>

              {/* Role grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-5">
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
                          : "bg-slate-50 border-[#e3e8ee] hover:bg-white hover:border-slate-300 hover:shadow-sm"
                      }`}
                      style={isActive ? { boxShadow: "0 2px 14px rgba(0,0,0,0.07)" } : undefined}
                    >
                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                        isActive ? c.activeBg : "bg-white border border-[#e3e8ee] group-hover:border-slate-300"
                      }`}>
                        <Icon className={`h-4 w-4 transition-colors ${isActive ? "text-white" : "text-[#64748d]"}`} />
                      </div>

                      {/* Label + tags */}
                      <div className="min-w-0 flex-1 mt-0.5">
                        <p className={`text-[13px] font-bold leading-tight mb-1.5 ${isActive ? "text-[#0d253d]" : "text-[#273951]"}`}>
                          {r.label}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {r.tags.map(tag => (
                            <span
                              key={tag}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md transition-colors ${
                                isActive ? c.tag : "bg-slate-100 text-[#64748d]"
                              }`}
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-[#533afd] shrink-0 mt-0.5 absolute top-3.5 right-3.5" />}
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
                    <div className="rounded-2xl border border-[#e3e8ee] overflow-hidden bg-slate-50">
                      {/* Role indicator bar */}
                      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-[#e3e8ee] bg-white">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${c.activeBg}`}>
                          <Icon className="h-3.5 w-3.5 text-white" />
                        </div>
                        <p className="text-[13px] font-bold text-[#0d253d]">Signing in as {role.label}</p>
                      </div>

                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                          <div>
                            <label className="block text-[10.5px] font-bold text-[#64748d] uppercase tracking-wider mb-1.5">Email</label>
                            <input
                              type="email" readOnly value={role.email}
                              className="w-full h-9 rounded-lg border border-[#e3e8ee] bg-white px-3 text-[11.5px] font-mono text-[#273951] focus:outline-none cursor-default select-all"
                            />
                          </div>
                          <div>
                            <label className="block text-[10.5px] font-bold text-[#64748d] uppercase tracking-wider mb-1.5">Password</label>
                            <div className="relative">
                              <input
                                type={showPw ? "text" : "password"} readOnly value={DEMO_PASSWORD}
                                className="w-full h-9 rounded-lg border border-[#e3e8ee] bg-white px-3 pr-9 text-[11.5px] font-mono text-[#273951] focus:outline-none cursor-default"
                              />
                              <button type="button" onClick={() => setShowPw(s => !s)} tabIndex={-1}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748d] hover:text-[#273951] transition-colors">
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
                          className="w-full inline-flex items-center justify-center gap-2 bg-[#533afd] hover:bg-[#4434d4] active:bg-indigo-800 disabled:opacity-60 text-white font-bold h-11 rounded-xl transition-colors text-[14px]"
                          style={{ boxShadow: "0 2px 10px rgba(83,58,253,0.40), 0 1px 3px rgba(0,0,0,0.08)" }}
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
                <p className="text-center text-[12.5px] text-[#64748d] py-1 mb-5">
                  Select a role above to see pre-filled credentials.
                </p>
              )}

              {/* Footer */}
              <div className="flex items-center justify-center gap-5 pt-5 border-t border-[#e3e8ee] text-[12.5px] text-[#64748d]">
                <Link href="/" className="hover:text-[#273951] transition-colors">← Homepage</Link>
                <span className="text-slate-200">|</span>
                <Link href="/contact" className="text-[#533afd] font-semibold hover:text-[#4434d4] transition-colors">
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
