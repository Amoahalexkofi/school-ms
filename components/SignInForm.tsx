"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

interface SignInPayload { email: string; password: string; }
interface Props { onSubmit: (payload: SignInPayload) => Promise<void>; accentColor?: string; }

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function SignInForm({ onSubmit, accentColor = "#6366f1" }: Props) {
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [showPw, setShowPw]         = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim())        return setError("Email is required");
    if (!isValidEmail(email)) return setError("Please enter a valid email address");
    if (!password)            return setError("Password is required");

    setSubmitting(true);
    try {
      await onSubmit({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {error && (
        <div role="alert" className="flex items-start gap-2.5 bg-red-50 border border-red-100 text-red-700 text-[13px] rounded-xl px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label htmlFor="signin-email" className="block text-sm font-semibold text-slate-700 mb-1.5">
          Email address
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="signin-email"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(null); }}
            autoComplete="email"
            autoFocus
            placeholder="you@school.edu"
            className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="signin-password" className="block text-sm font-semibold text-slate-700">Password</label>
          <Link href="/forgot-password" className="text-xs font-semibold transition-colors hover:opacity-75"
            style={{ color: accentColor }}>
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            id="signin-password"
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(null); }}
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full pl-10 pr-11 py-3 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-400 transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            tabIndex={-1}
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-[14px] transition-all hover:opacity-90 active:scale-[0.99] mt-1"
        style={{ background: accentColor, boxShadow: `0 4px 20px ${accentColor}45` }}
      >
        {submitting ? (
          <>
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Signing in…
          </>
        ) : (
          <>Sign in <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
    </form>
  );
}
