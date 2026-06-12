import { headers } from "next/headers";
import { GraduationCap, CheckCircle2, Users, DollarSign, BarChart3, ArrowRight } from "lucide-react";
import { SignInPage } from "@/components/SignInPage";
import Link from "next/link";

export default async function SignInRoute() {
  const h = await headers();
  const tenant = h.get("x-novalss-host") ?? h.get("host") ?? "";

  return (
    <div className="min-h-screen flex">

      {/* ── Left panel — dark brand side ── */}
      <div className="hidden lg:flex lg:w-[55%] relative bg-slate-950 flex-col overflow-hidden">

        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px,rgba(255,255,255,0.03) 1px,transparent 0)", backgroundSize: "28px 28px" }} />

        {/* Gradient orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-blue-700/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative flex flex-col h-full px-12 py-10">

          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-white font-black text-xl tracking-tight">Skula</span>
          </div>

          {/* Main copy */}
          <div className="flex-1 flex flex-col justify-center max-w-md">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-5">
              School Management Platform
            </p>
            <h1 className="text-4xl font-black text-white leading-[1.1] tracking-tight">
              Everything your school needs.<br />
              <span className="text-indigo-400">One place.</span>
            </h1>
            <p className="text-slate-400 text-base mt-5 leading-relaxed">
              Students, fees, attendance, exams, staff — managed from a single dashboard. Live in under 30 minutes.
            </p>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-3 mt-10">
              {[
                { icon: Users,      value: "50+",  label: "Schools",    color: "text-blue-400",   bg: "bg-blue-500/10" },
                { icon: DollarSign, value: "98%",  label: "Fee accuracy",color: "text-emerald-400",bg: "bg-emerald-500/10" },
                { icon: BarChart3,  value: "3hrs",  label: "Saved/week", color: "text-violet-400", bg: "bg-violet-500/10" },
              ].map(({ icon: Icon, value, label, color, bg }) => (
                <div key={label} className="bg-white/5 border border-white/8 rounded-2xl p-4">
                  <div className={`w-8 h-8 ${bg} rounded-lg flex items-center justify-center mb-3`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className={`text-xl font-black ${color} leading-none`}>{value}</p>
                  <p className="text-slate-500 text-xs mt-1">{label}</p>
                </div>
              ))}
            </div>

            {/* Features list */}
            <ul className="mt-10 space-y-3">
              {[
                "Fee collection with instant printable receipts",
                "Digital attendance with parent SMS alerts",
                "Exam marks → ranked marksheets in one click",
                "Parent portal — results, fees, timetable",
              ].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Testimonial */}
          <div className="shrink-0 border-t border-white/8 pt-8">
            <p className="text-slate-300 text-sm leading-relaxed italic">
              "We saved 3 days of admin work every term. I cannot believe how much time we were wasting before."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black">AM</div>
              <div>
                <p className="text-white text-xs font-semibold">Mrs. Adjoa Mensah</p>
                <p className="text-slate-500 text-xs">Principal · GoldCoast Academy, Accra</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form side ── */}
      <div className="flex-1 flex flex-col bg-white">

        {/* Mobile logo (hidden on desktop) */}
        <div className="lg:hidden flex items-center gap-2.5 px-8 pt-8 pb-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="font-black text-gray-900">Skula</span>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8 py-10">
          <div className="w-full max-w-sm">

            {/* Desktop logo mark */}
            <div className="hidden lg:flex w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 items-center justify-center mb-8 shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>

            <h2 className="text-2xl font-black text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-500 text-sm mt-1.5">Sign in to your school dashboard</p>

            <div className="mt-8">
              <SignInPage tenant={tenant} />
            </div>

            <div className="mt-8 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-500">
                New school?{" "}
                <Link href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 inline-flex items-center gap-1">
                  Register for free <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-8 pb-8 text-center">
          <p className="text-xs text-gray-400">
            Powered by{" "}
            <span className="font-semibold text-gray-500">Skula</span>
            {" "}·{" "}
            <a href="https://novalss.com" className="hover:underline">a Novalss product</a>
          </p>
        </div>
      </div>
    </div>
  );
}
