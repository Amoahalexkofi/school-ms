"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import {
  GraduationCap, ShieldCheck, BookOpen, Wallet, Users,
  Eye, EyeOff, ArrowRight, ChevronRight,
} from "lucide-react";

const DEMO_PASSWORD = "Demo@Skula2026";

const ROLES = [
  {
    key: "admin",
    label: "Administrator",
    email: "demo@getskula.com",
    icon: ShieldCheck,
    color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    activeColor: "bg-indigo-600 text-white border-indigo-600",
    desc: "Full access — students, fees, staff, attendance, reports",
  },
  {
    key: "teacher",
    label: "Teacher",
    email: "teacher.demo@getskula.com",
    icon: BookOpen,
    color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    activeColor: "bg-emerald-600 text-white border-emerald-600",
    desc: "Classes, homework, attendance, exam marks",
  },
  {
    key: "accountant",
    label: "Accountant",
    email: "accountant.demo@getskula.com",
    icon: Wallet,
    color: "bg-violet-50 text-violet-600 border-violet-200",
    activeColor: "bg-violet-600 text-white border-violet-600",
    desc: "Fee collection, invoices, receipts, income & expenses",
  },
  {
    key: "parent",
    label: "Parent",
    email: "parent.demo@getskula.com",
    icon: Users,
    color: "bg-rose-50 text-rose-600 border-rose-200",
    activeColor: "bg-rose-600 text-white border-rose-600",
    desc: "Child's results, attendance, fee balance, timetable",
  },
] as const;

type RoleKey = typeof ROLES[number]["key"];

export default function DemoPage() {
  const router = useRouter();
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
      setError("Demo account not found. Ask the admin to run the seed script.");
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-lg">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
              <GraduationCap className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
            </div>
            <span className="font-black text-slate-900 text-[18px] tracking-tight">Skula</span>
          </div>
          <h1 className="text-[26px] font-black text-slate-900 leading-tight">Try the demo</h1>
          <p className="text-[14px] text-slate-500 mt-1.5">
            Pick a role to explore what each user sees.
          </p>
        </div>

        {/* Role cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {ROLES.map((r) => {
            const Icon = r.icon;
            const isActive = selected === r.key;
            return (
              <button
                key={r.key}
                type="button"
                onClick={() => { setSelected(r.key); setError(""); }}
                className={`relative text-left p-4 rounded-xl border-2 transition-all duration-150 group ${
                  isActive
                    ? "bg-white border-indigo-400 shadow-[0_0_0_3px_rgba(99,102,241,0.12)]"
                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm"
                }`}
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 border ${
                  isActive ? r.activeColor : r.color
                }`}>
                  <Icon className="h-4.5 w-[18px] h-[18px]" />
                </div>
                <p className={`text-[13px] font-bold ${isActive ? "text-indigo-700" : "text-slate-800"}`}>
                  {r.label}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{r.desc}</p>
                {isActive && (
                  <div className="absolute top-3 right-3 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center">
                    <ChevronRight className="h-2.5 w-2.5 text-white" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Pre-filled credentials + login — shown after role selection */}
        {role && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-6">
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4">
              Sign in as {role.label}
            </p>

            <div className="space-y-3 mb-5">
              {/* Email — read only */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1">Email</label>
                <input
                  type="email"
                  readOnly
                  value={role.email}
                  className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-[13px] font-mono text-slate-700 focus:outline-none cursor-default select-all"
                />
              </div>

              {/* Password — pre-filled, toggleable */}
              <div>
                <label className="block text-[12px] font-semibold text-slate-500 mb-1">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    readOnly
                    value={DEMO_PASSWORD}
                    className="w-full h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 pr-10 text-[13px] font-mono text-slate-700 focus:outline-none cursor-default"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-[12px] text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-4">
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold h-11 rounded-xl transition-colors text-[14px]"
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

        {/* Footer links */}
        <div className="flex items-center justify-center gap-5 mt-6 text-[12px] text-slate-400">
          <Link href="/" className="hover:text-slate-600 transition-colors">← Homepage</Link>
          <span>·</span>
          <Link href="/contact" className="hover:text-slate-600 transition-colors text-indigo-600 font-semibold">
            Get your own school →
          </Link>
        </div>
      </div>
    </div>
  );
}
