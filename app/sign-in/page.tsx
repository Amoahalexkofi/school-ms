import { headers } from "next/headers";
import { GraduationCap, CheckCircle2, Users, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";
import Link from "next/link";

export default async function SignInRoute() {
  const h = await headers();
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — hero gradient ── */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col overflow-hidden border-r border-indigo-200/50"
        style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}>

        {/* Blobs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)", backgroundSize: "40px 40px" }} />

        <div className="relative flex flex-col h-full px-14 py-12">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-300/50">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-slate-900 font-black text-2xl tracking-tight">Skula</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center">
            <p className="text-indigo-600 text-[11px] font-black uppercase tracking-[0.2em] mb-6">
              School Management Platform
            </p>
            <h1 className="text-[42px] font-black text-slate-900 leading-[1.08] tracking-tight mb-5">
              Everything your<br />school needs.<br />
              <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                One place.
              </span>
            </h1>
            <p className="text-slate-600 text-[15px] leading-relaxed mb-10 max-w-sm">
              Students, fees, attendance, exams, staff — managed from one dashboard. Live in under 30 minutes.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 mb-10">
              {[
                { icon: Users,      value: "50+",  label: "Schools",      color: "text-indigo-600", bg: "bg-white/70" },
                { icon: DollarSign, value: "98%",  label: "Fee accuracy", color: "text-emerald-600", bg: "bg-white/70" },
                { icon: BarChart3,  value: "3hrs", label: "Saved / week", color: "text-violet-600",  bg: "bg-white/70" },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className={`${bg} border border-white/90 rounded-2xl p-4 backdrop-blur-sm shadow-sm`}>
                  <Icon className={`h-5 w-5 ${color} mb-3`} />
                  <p className={`text-2xl font-black ${color} leading-none`}>{value}</p>
                  <p className="text-slate-500 text-[11px] font-medium mt-1.5">{label}</p>
                </div>
              ))}
            </div>

            {/* Features list */}
            <ul className="space-y-3.5">
              {[
                "Fee collection with instant printable receipts",
                "Digital attendance with parent SMS alerts",
                "Exam marks → ranked marksheets in one click",
                "Parent portal — results, fees, timetable",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-[14px] font-medium text-slate-700">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* ── Right panel — form side ── */}
      <div className="lg:w-1/2 flex-1 flex flex-col relative"
        style={{ background: "linear-gradient(145deg, #f8fafc 0%, #f1f5f9 50%, #f8fafc 100%)" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)", backgroundSize: "24px 24px" }} />

        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-px"
          style={{ background: "linear-gradient(180deg, transparent 0%, #6366f1 30%, #8b5cf6 70%, transparent 100%)" }} />

        {/* Mobile logo */}
        <div className="relative lg:hidden flex items-center gap-2.5 px-8 pt-8 pb-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-gray-900">Skula</span>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="w-full max-w-[440px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl shadow-slate-200/80 px-10 py-12">

            {/* Logo mark */}
            <div className="flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center mb-8 shadow-lg shadow-indigo-300/40">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>

            <h2 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Welcome back</h2>
            <p className="text-gray-400 text-[14px] mt-2 mb-8">Sign in to your school dashboard</p>

            <SignInPage tenant={tenant} />

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-[13px] text-gray-400">
                New to Skula?{" "}
                <Link href="/contact" className="text-indigo-600 font-bold hover:text-indigo-700 inline-flex items-center gap-1">
                  Get started free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="relative shrink-0 px-8 pb-8 text-center">
          <p className="text-[11px] text-gray-400">
            Powered by <span className="font-semibold text-gray-500">Skula</span>{" "}·{" "}
            <a href="https://novalss.com" className="hover:underline">a Novalss product</a>
          </p>
        </div>
      </div>
    </div>
  );
}
