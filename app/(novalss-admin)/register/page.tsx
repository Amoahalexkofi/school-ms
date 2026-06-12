"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, ArrowRight, CheckCircle2, RefreshCw, AlertCircle,
  Building2, Mail, Lock, User, Phone, Globe, Eye, EyeOff, Sparkles,
  Users, Shield, Zap,
} from "lucide-react";

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? "getskula.com";

// ── Provisioning steps animation ──────────────────────────────────────────────
const STEPS = [
  "Allocating your private database",
  "Creating tables and structure",
  "Setting up admin account",
  "Configuring your school portal",
  "Almost ready…",
];

function ProvisioningScreen() {
  const [done] = useState([0, 1, 2]);
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
          <RefreshCw className="h-9 w-9 text-indigo-600 animate-spin" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-indigo-200 animate-ping opacity-30" />
      </div>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">Building your school…</h2>
      <p className="text-gray-500 text-sm mt-2 max-w-xs">
        Setting up your private workspace. This takes about 15 seconds.
      </p>
      <div className="mt-8 w-full max-w-sm space-y-2.5">
        {STEPS.map((step, i) => (
          <div key={step} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
            done.includes(i) ? "bg-emerald-50 text-emerald-700" :
            i === done.length ? "bg-indigo-50 text-indigo-700 animate-pulse" :
            "bg-gray-50 text-gray-400"
          }`}>
            {done.includes(i)
              ? <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
              : i === done.length
                ? <RefreshCw className="h-4 w-4 text-indigo-500 shrink-0 animate-spin" />
                : <div className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />
            }
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function SuccessScreen({ school, email, domain }: { school: any; email: string; domain: string }) {
  const url = `https://${school.subdomain}.${domain}`;
  return (
    <div className="flex flex-col items-center text-center py-4">
      <div className="w-20 h-20 rounded-full bg-emerald-50 flex items-center justify-center mb-6">
        <CheckCircle2 className="h-10 w-10 text-emerald-500" />
      </div>
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
        <Sparkles className="h-3.5 w-3.5" /> School created successfully
      </div>
      <h2 className="text-2xl font-black text-gray-900 tracking-tight">{school.name} is live!</h2>
      <p className="text-gray-500 text-sm mt-2">Your school portal is ready. Sign in to complete setup.</p>

      <div className="mt-8 w-full bg-slate-950 rounded-2xl p-5 text-left">
        <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-3">Your school URL</p>
        <a href={url} target="_blank" rel="noopener noreferrer"
          className="flex items-center justify-between gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-3 group hover:bg-white/10 transition-colors">
          <span className="text-indigo-400 font-mono text-sm font-bold truncate">{url}</span>
          <ArrowRight className="h-4 w-4 text-indigo-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </a>
        <div className="mt-3 flex items-center gap-2 text-slate-400 text-xs">
          <Mail className="h-3.5 w-3.5 shrink-0" />
          Login with: <span className="text-white font-medium">{email}</span>
        </div>
      </div>

      <a href={url} target="_blank" rel="noopener noreferrer"
        className="mt-6 w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25">
        Open my school portal <ArrowRight className="h-4 w-4" />
      </a>

      <p className="text-xs text-gray-400 mt-4">
        DNS may take 1–2 min to propagate on first load.
      </p>
    </div>
  );
}

export default function RegisterPage() {
  const [step, setStep]   = useState<"form" | "provisioning" | "done">("form");
  const [error, setError] = useState("");
  const [school, setSchool] = useState<any>(null);
  const [showPw, setShowPw] = useState(false);
  const [showCpw, setShowCpw] = useState(false);
  const [form, setForm] = useState({
    name: "", subdomain: "", adminEmail: "", adminPassword: "",
    confirmPassword: "", adminName: "", phone: "",
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); setError(""); }

  function onNameChange(v: string) {
    const slug = v.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20);
    setForm(f => ({ ...f, name: v, subdomain: f.subdomain || slug }));
    setError("");
  }

  const pwStrength = (() => {
    const p = form.adminPassword;
    if (!p) return null;
    let score = 0;
    if (p.length >= 8) score++;
    if (p.length >= 12) score++;
    if (/[A-Z]/.test(p)) score++;
    if (/[0-9]/.test(p)) score++;
    if (/[^A-Za-z0-9]/.test(p)) score++;
    if (score <= 2) return { label: "Weak", color: "bg-red-400", width: "w-1/4" };
    if (score <= 3) return { label: "Fair", color: "bg-amber-400", width: "w-2/4" };
    if (score <= 4) return { label: "Good", color: "bg-blue-500", width: "w-3/4" };
    return { label: "Strong", color: "bg-emerald-500", width: "w-full" };
  })();

  async function submit() {
    if (!form.name.trim())          return setError("School name is required");
    if (!form.subdomain.trim())     return setError("School URL is required");
    if (!form.adminEmail.trim())    return setError("Email is required");
    if (!form.adminPassword)        return setError("Password is required");
    if (form.adminPassword.length < 8) return setError("Password must be at least 8 characters");
    if (form.adminPassword !== form.confirmPassword) return setError("Passwords do not match");

    setError("");
    setStep("provisioning");

    try {
      const res = await fetch("/api/admin/schools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          subdomain: form.subdomain,
          adminEmail: form.adminEmail,
          adminPassword: form.adminPassword,
          adminName: form.adminName,
          phone: form.phone,
          plan: "trial",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Registration failed"); setStep("form"); return; }
      setSchool(data);
      setStep("done");
    } catch {
      setError("Network error. Please try again.");
      setStep("form");
    }
  }

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[45%] relative bg-slate-950 flex-col overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.03) 1px,transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-20 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-700/15 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-12 py-10">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Skula</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center max-w-sm">
            <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold px-3 py-1.5 rounded-full mb-6 w-fit">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              30-day free trial · No card needed
            </div>
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Your school,<br />
              <span className="text-indigo-400">online in minutes.</span>
            </h1>
            <p className="text-slate-400 text-sm mt-5 leading-relaxed">
              One form. 30 seconds. Your school gets its own private portal, admin account, and full platform access — instantly.
            </p>

            <div className="mt-10 space-y-4">
              {[
                { icon: Shield,   color: "text-blue-400",    bg: "bg-blue-500/10",   title: "Fully isolated data", desc: "Your school's data is completely private — no shared databases." },
                { icon: Zap,      color: "text-amber-400",   bg: "bg-amber-500/10",  title: "Live in 30 seconds",  desc: "Your portal, admin account and all 20+ modules ready instantly." },
                { icon: Users,    color: "text-emerald-400", bg: "bg-emerald-500/10",title: "All roles included",   desc: "Admin, teacher, accountant, student and parent portals." },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div key={title} className="flex items-start gap-4">
                  <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center shrink-0 mt-0.5`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{title}</p>
                    <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* What's included */}
            <div className="mt-10 pt-8 border-t border-white/8">
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-widest mb-4">Everything included, free</p>
              <div className="flex flex-wrap gap-2">
                {["Students","Fees","Attendance","Exams","Staff","Timetable","Library","Reports","Parent Portal"].map(m => (
                  <span key={m} className="bg-white/5 border border-white/8 text-slate-400 text-xs px-2.5 py-1 rounded-full">{m}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Mobile nav */}
        <div className="lg:hidden flex items-center justify-between px-6 pt-6 pb-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-gray-900 text-sm">Skula</span>
          </Link>
          <Link href="/sign-in" className="text-sm text-gray-500 hover:text-gray-700 font-medium">Sign in</Link>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="w-full max-w-md">

            {step === "provisioning" ? (
              <ProvisioningScreen />
            ) : step === "done" && school ? (
              <SuccessScreen school={school} email={form.adminEmail} domain={APP_DOMAIN} />
            ) : (
              <>
                {/* Header */}
                <div className="mb-8">
                  <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-6 shadow-lg shadow-indigo-500/25">
                    <GraduationCap className="h-5 w-5 text-white" />
                  </div>
                  <h2 className="text-2xl font-black text-gray-900 tracking-tight">Create your school</h2>
                  <p className="text-gray-500 text-sm mt-1.5">Free for 30 days · No credit card · All modules included</p>
                </div>

                <div className="space-y-4">
                  {/* School name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">School name <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        value={form.name}
                        onChange={e => onNameChange(e.target.value)}
                        placeholder="e.g. Sunshine Academy"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* School URL */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your school URL <span className="text-red-400">*</span></label>
                    <div className="flex items-center gap-0 border border-gray-200 rounded-xl overflow-hidden bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-400 transition-all">
                      <Globe className="h-4 w-4 text-gray-400 ml-3.5 shrink-0" />
                      <input
                        value={form.subdomain}
                        onChange={e => set("subdomain", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="sunshine"
                        className="flex-1 pl-2.5 pr-2 py-3 text-sm bg-transparent outline-none text-gray-900"
                      />
                      <span className="pr-3.5 text-sm text-gray-400 font-medium whitespace-nowrap">.{APP_DOMAIN}</span>
                    </div>
                    {form.subdomain && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                        <p className="text-xs text-emerald-600 font-medium">{form.subdomain}.{APP_DOMAIN}</p>
                      </div>
                    )}
                  </div>

                  {/* Name + Phone */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Your name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          value={form.adminName}
                          onChange={e => set("adminName", e.target.value)}
                          placeholder="Dr. Kwame Mensah"
                          className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          value={form.phone}
                          onChange={e => set("phone", e.target.value)}
                          placeholder="+233 XX XXX XXXX"
                          className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Admin email <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                      <input
                        type="email"
                        value={form.adminEmail}
                        onChange={e => set("adminEmail", e.target.value)}
                        placeholder="you@yourschool.edu.gh"
                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                      />
                    </div>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          type={showPw ? "text" : "password"}
                          value={form.adminPassword}
                          onChange={e => set("adminPassword", e.target.value)}
                          placeholder="Min. 8 characters"
                          className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                        <button type="button" onClick={() => setShowPw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showPw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {pwStrength && (
                        <div className="mt-1.5">
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all ${pwStrength.color} ${pwStrength.width}`} />
                          </div>
                          <p className={`text-[10px] mt-0.5 font-medium ${pwStrength.label === "Strong" ? "text-emerald-600" : pwStrength.label === "Weak" ? "text-red-500" : "text-gray-500"}`}>{pwStrength.label}</p>
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Confirm <span className="text-red-400">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                        <input
                          type={showCpw ? "text" : "password"}
                          value={form.confirmPassword}
                          onChange={e => set("confirmPassword", e.target.value)}
                          placeholder="Repeat password"
                          className="w-full pl-10 pr-9 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400 transition-all"
                        />
                        <button type="button" onClick={() => setShowCpw(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                          {showCpw ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                      {form.confirmPassword && form.adminPassword && (
                        <p className={`text-[10px] mt-1.5 font-medium flex items-center gap-1 ${form.adminPassword === form.confirmPassword ? "text-emerald-600" : "text-red-500"}`}>
                          {form.adminPassword === form.confirmPassword
                            ? <><CheckCircle2 className="h-3 w-3" /> Passwords match</>
                            : <><AlertCircle className="h-3 w-3" /> Passwords don&apos;t match</>}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /> {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    onClick={submit}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 flex items-center justify-center gap-2 mt-2"
                  >
                    <Sparkles className="h-4 w-4" /> Create my school — Free 30 days <ArrowRight className="h-4 w-4" />
                  </button>

                  <p className="text-xs text-center text-gray-400 leading-relaxed">
                    By registering you agree to our{" "}
                    <a href="#" className="text-gray-500 hover:underline">Terms of Service</a>
                    {" "}and{" "}
                    <a href="#" className="text-gray-500 hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 pb-8 text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-700">Sign in</Link>
            <span className="mx-2 text-gray-300">·</span>
            Powered by <span className="font-semibold text-gray-500">Skula</span>
          </p>
        </div>
      </div>
    </div>
  );
}
