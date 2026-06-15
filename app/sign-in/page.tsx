import { headers } from "next/headers";
import { GraduationCap } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";
import Link from "next/link";

export default async function SignInRoute() {
  const h = await headers();
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  return (
    <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center p-4">

      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.025) 1px,transparent 0)", backgroundSize: "32px 32px" }} />
      {/* Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-emerald-600/[0.07] rounded-full blur-[120px] pointer-events-none" />

      <div className="relative w-full max-w-sm">

        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-white text-lg tracking-tight">Skula</span>
        </div>

        {/* Card */}
        <div className="bg-[#111318] border border-white/[0.07] rounded-2xl p-7 shadow-2xl shadow-black/40">
          <h1 className="text-[22px] font-black text-white tracking-tight">Welcome back</h1>
          <p className="text-[13px] text-white/30 mt-1 mb-7">Sign in to your school dashboard</p>

          <SignInPage tenant={tenant} />
        </div>

        {/* Footer */}
        <p className="text-center text-[11px] text-white/15 mt-6">
          New school?{" "}
          <Link href="/contact" className="text-emerald-400/60 hover:text-emerald-400 transition-colors">
            Get set up →
          </Link>
        </p>
        <p className="text-center text-[10px] text-white/10 mt-3">
          Powered by Skula · a{" "}
          <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/25 transition-colors">
            Novalss
          </a>{" "}
          product
        </p>
      </div>
    </div>
  );
}
