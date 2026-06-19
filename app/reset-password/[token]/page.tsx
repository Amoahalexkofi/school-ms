"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function ResetPasswordPage() {
  const { token }             = useParams<{ token: string }>();
  const router                = useRouter();
  const [password, setPass]   = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShow]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState("");

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 8 ? 2 : password.length < 10 ? 3 : 4;
  const strengthLabel = ["", "Too short", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-emerald-500"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }

    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Something went wrong");
      setDone(true);
      setTimeout(() => router.push("/sign-in"), 3000);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "linear-gradient(150deg, #f8faff 0%, #f0f4ff 100%)" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-8">
        <Link href="/" className="flex items-center">
          <img src="/images/skula-logo.png" alt="Skula" className="h-9 object-contain" />
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </div>

      {/* Centred card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">

          {done ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/80 p-10 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Password updated!</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-2">
                Your password has been changed successfully.
              </p>
              <p className="text-xs text-slate-400 mb-6">Redirecting you to sign in…</p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                Sign in now →
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/80 p-8 sm:p-10">

              <div className="mb-7">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                  <Lock className="h-5 w-5 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Set a new password</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  Choose something strong — at least 8 characters, mixed case and numbers.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">

                {/* New password */}
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    New password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="password"
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => { setPass(e.target.value); setError(""); }}
                      required minLength={6}
                      autoFocus
                      placeholder="At least 8 characters"
                      className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
                    />
                    <button type="button" onClick={() => setShow(s => !s)} tabIndex={-1}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Strength bar */}
                  {password && (
                    <div className="mt-2 space-y-1">
                      <div className="flex gap-1">
                        {[1,2,3,4].map(i => (
                          <div key={i} className={`h-1 flex-1 rounded-full transition-colors duration-300 ${strength >= i ? strengthColor[strength] : "bg-slate-100"}`} />
                        ))}
                      </div>
                      <p className={`text-[11px] font-medium ${strength <= 1 ? "text-red-500" : strength === 2 ? "text-amber-500" : strength === 3 ? "text-yellow-600" : "text-emerald-600"}`}>
                        {strengthLabel[strength]}
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label htmlFor="confirm" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="confirm"
                      type={showPass ? "text" : "password"}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(""); }}
                      required
                      placeholder="Repeat your password"
                      className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all ${
                        confirm && password !== confirm ? "border-red-300" : "border-slate-200"
                      }`}
                    />
                    {confirm && password === confirm && (
                      <CheckCircle2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-500" />
                    )}
                  </div>
                  {confirm && password !== confirm && (
                    <p className="text-[11px] text-red-500 mt-1">Passwords don't match</p>
                  )}
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !password || !confirm}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Updating…
                    </span>
                  ) : "Update password"}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-6">
                <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  ← Back to sign in
                </Link>
              </p>
            </div>
          )}

        </div>
      </div>

      {/* Footer */}
      <p className="text-center text-xs text-slate-400 pb-8">
        © {new Date().getFullYear()} Skula · <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="hover:text-slate-600 transition-colors">a Novalss product</a>
      </p>
    </div>
  );
}
