"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

interface SignInPayload { email: string; password: string; }
interface Props { onSubmit: (payload: SignInPayload) => Promise<void>; }

function isValidEmail(e: string) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }

export function SignInForm({ onSubmit }: Props) {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!email.trim())        return setError("Email is required");
    if (!isValidEmail(email)) return setError("Enter a valid email address");
    if (!password)            return setError("Password is required");
    setLoading(true);
    try {
      await onSubmit({ email: email.trim(), password });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(false);
    }
  }

  const inputCls = "w-full bg-white/[0.05] border border-white/[0.08] text-white/80 placeholder-white/20 rounded-xl px-4 py-3 text-[13px] outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {error && (
        <div className="flex items-start gap-2.5 bg-red-500/[0.08] border border-red-500/20 text-red-400 text-[12px] rounded-xl px-4 py-3">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-px" />
          {error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-[12px] font-semibold text-white/40 mb-1.5 uppercase tracking-wide">
          Email
        </label>
        <input
          id="email" type="email" value={email}
          onChange={e => { setEmail(e.target.value); setError(null); }}
          autoComplete="email" placeholder="you@school.edu"
          className={inputCls}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="password" className="block text-[12px] font-semibold text-white/40 uppercase tracking-wide">
            Password
          </label>
          <Link href="/forgot-password" className="text-[11px] text-emerald-400/60 hover:text-emerald-400 font-medium transition-colors">
            Forgot?
          </Link>
        </div>
        <div className="relative">
          <input
            id="password" type={showPw ? "text" : "password"} value={password}
            onChange={e => { setPassword(e.target.value); setError(null); }}
            autoComplete="current-password" placeholder="••••••••"
            className={inputCls + " pr-11"}
          />
          <button
            type="button" tabIndex={-1}
            onClick={() => setShowPw(s => !s)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl text-[13px] transition-colors shadow-lg shadow-emerald-500/20 mt-1"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Signing in…
          </span>
        ) : "Sign in"}
      </button>
    </form>
  );
}
