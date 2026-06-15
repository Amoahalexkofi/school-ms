"use client";

import Link from "next/link";
import { GraduationCap, Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";

const DEMO_EMAIL    = "demo@getskula.com";
const DEMO_PASSWORD = "Demo@Skula2026";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }
  return (
    <button
      onClick={copy}
      className="ml-auto p-1.5 rounded-md hover:bg-slate-100 transition-colors text-slate-400 hover:text-slate-600"
      title="Copy"
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
    </button>
  );
}

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-2xl border border-slate-200 shadow-[0_4px_24px_rgba(0,0,0,0.07)] p-8">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-slate-900 text-[16px] tracking-tight">Skula</span>
        </div>

        <h1 className="text-[22px] font-black text-slate-900 leading-tight">Try the demo</h1>
        <p className="text-[14px] text-slate-500 mt-1.5 mb-6">
          Use these credentials to sign in and explore the full dashboard.
        </p>

        {/* Credentials */}
        <div className="space-y-3 mb-6">
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Email</p>
              <p className="text-[13px] font-mono text-slate-800 truncate">{DEMO_EMAIL}</p>
            </div>
            <CopyButton text={DEMO_EMAIL} />
          </div>
          <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Password</p>
              <p className="text-[13px] font-mono text-slate-800">{DEMO_PASSWORD}</p>
            </div>
            <CopyButton text={DEMO_PASSWORD} />
          </div>
        </div>

        <Link
          href="/sign-in"
          className="w-full inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold h-11 rounded-xl transition-colors text-[14px]"
        >
          Sign in to demo <ArrowRight className="h-4 w-4" />
        </Link>

        <p className="text-center text-[12px] text-slate-400 mt-5">
          Demo data resets daily.{" "}
          <Link href="/contact" className="text-indigo-600 font-semibold hover:underline">
            Get your own school →
          </Link>
        </p>
      </div>

      {/* Back link */}
      <Link
        href="/"
        className="mt-6 text-[13px] text-slate-400 hover:text-slate-600 transition-colors"
      >
        ← Back to homepage
      </Link>
    </div>
  );
}
