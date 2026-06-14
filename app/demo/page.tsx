"use client";

import { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { GraduationCap } from "lucide-react";

export default function DemoPage() {
  const [status, setStatus] = useState<"loading" | "error">("loading");

  useEffect(() => {
    signIn("credentials", {
      email: "demo@getskula.com",
      password: "Demo@Skula2026",
      redirect: true,
      callbackUrl: "/dashboard",
    }).catch(() => setStatus("error"));
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-indigo-600 rounded-2xl mb-6">
          <GraduationCap className="h-7 w-7 text-white" />
        </div>

        {status === "loading" ? (
          <>
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" />
            </div>
            <p className="text-white font-semibold text-lg">Opening demo…</p>
            <p className="text-slate-500 text-sm mt-2">Logging you in automatically</p>
          </>
        ) : (
          <>
            <p className="text-white font-semibold text-lg mb-2">Couldn't auto-login</p>
            <p className="text-slate-400 text-sm mb-6">Use these credentials on the sign-in page:</p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-5 text-left space-y-3 max-w-xs mx-auto">
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Email</p>
                <p className="text-white font-mono text-sm">demo@getskula.com</p>
              </div>
              <div>
                <p className="text-slate-500 text-xs uppercase tracking-wide mb-1">Password</p>
                <p className="text-white font-mono text-sm">Demo@Skula2026</p>
              </div>
            </div>
            <a
              href="/sign-in"
              className="mt-6 inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-500 transition-colors"
            >
              Go to sign-in →
            </a>
          </>
        )}
      </div>
    </div>
  );
}
