"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Something went wrong");
      }
      setSent(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ background: "linear-gradient(150deg, #f8faff 0%, #f0f4ff 100%)" }}>

      {/* Top bar */}
      <div className="flex items-center justify-between px-8 pt-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200 group-hover:bg-indigo-700 transition-colors">
            <GraduationCap className="h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-black text-slate-900 text-[15px] tracking-tight">Skula</span>
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

          {sent ? (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/80 p-10 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Check your inbox</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-8">
                If <span className="font-semibold text-slate-700">{email}</span> is registered,
                a reset link is on its way. It expires in 1 hour.
              </p>
              <Link
                href="/sign-in"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to sign in
              </Link>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-xl shadow-slate-100/80 p-8 sm:p-10">

              <div className="mb-7">
                <div className="w-11 h-11 bg-indigo-50 rounded-2xl flex items-center justify-center mb-5">
                  <Mail className="h-5 w-5 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">Forgot your password?</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">
                  No problem. Enter your email and we'll send a reset link straight away.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      autoFocus
                      placeholder="you@school.edu"
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-start gap-2 bg-red-50 border border-red-100 text-red-700 text-sm rounded-xl px-4 py-3">
                    <span className="shrink-0 mt-0.5">⚠</span>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-200 mt-1"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                      Sending…
                    </span>
                  ) : "Send reset link"}
                </button>
              </form>

              <p className="text-center text-xs text-slate-400 mt-6">
                Remember your password?{" "}
                <Link href="/sign-in" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">
                  Sign in
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
