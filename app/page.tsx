import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/lib/auth";
import {
  Users, ClipboardList, DollarSign, GraduationCap,
  CheckCircle2, ArrowRight, Star, ChevronRight,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Novalss</span>
            </Link>
            <div className="hidden lg:flex items-center gap-7">
              <a href="#features"     className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">How it works</a>
              <a href="#pricing"      className="text-sm text-gray-500 hover:text-gray-900 transition-colors">Pricing</a>
              <a href="#faq"          className="text-sm text-gray-500 hover:text-gray-900 transition-colors">FAQ</a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in"  className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 transition-colors">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-sm bg-gray-900 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-gray-700 transition-colors">
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative bg-slate-950 pt-24 pb-0 overflow-hidden">
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        {/* Glow */}
        <div className="absolute top-0 left-0 w-[600px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-600/15 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          {/* ── Two-column hero ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center pt-8 pb-12 lg:pb-0">

            {/* Left — copy */}
            <div>
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-white/60 text-xs px-3.5 py-1.5 rounded-full font-medium mb-6">
                <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                Now live — 50+ schools onboarded
              </div>
              <h1 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.05]">
                The operating<br />system for<br />
                <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 bg-clip-text text-transparent">
                  modern schools
                </span>
              </h1>
              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                Students, staff, fees, exams, attendance — and 17 more modules — in one platform.
                Every school gets its own subdomain in under 2 minutes.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
                <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-900/50">
                  Start free — no card needed <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center gap-2 text-slate-300 border border-slate-700 px-6 py-3.5 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                  Sign in to your school
                </Link>
              </div>
              <div className="flex flex-wrap gap-4 mt-6">
                {["No credit card", "14-day free trial", "2-minute setup"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — real photo */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden" style={{ height: 480 }}>
                <Image
                  src="/images/teacher-students.jpg"
                  alt="Teacher with students at Community Secondary School, Port Harcourt"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1280px) 50vw, 640px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/10 to-transparent" />
                {/* Floating stats overlay */}
                <div className="absolute top-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2.5">
                  <p className="text-white text-xs font-bold">842 students enrolled</p>
                  <p className="text-white/60 text-[10px]">2024/2025 session</p>
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-bold">St. Mary's Academy, Accra</p>
                      <p className="text-white/60 text-xs mt-0.5">Running on Novalss since 2023</p>
                    </div>
                    <div className="flex gap-0.5">
                      {[1,2,3,4,5].map(i => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                </div>
              </div>
              {/* Floating card bottom-left */}
              <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-3.5 border border-gray-100 z-10">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Attendance today</p>
                <p className="text-2xl font-black text-gray-900 mt-0.5">96%</p>
                <div className="flex items-center gap-1 mt-1">
                  <div className="h-1.5 flex-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full w-[96%] bg-emerald-500 rounded-full" />
                  </div>
                  <span className="text-[10px] text-emerald-600 font-semibold">+2%</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Dashboard mockup (full-width, below the split) ── */}
          <div className="mt-16 rounded-t-2xl border border-white/10 overflow-hidden"
               style={{ boxShadow: "0 -20px 80px rgba(99,102,241,0.18), 0 0 0 1px rgba(255,255,255,0.05)" }}>
            {/* Browser chrome */}
            <div className="bg-slate-800 border-b border-white/8 px-4 py-2.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 max-w-xs mx-auto bg-slate-900 rounded-md px-3 py-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-400 font-mono">stmarys.novalss.com/dashboard</span>
              </div>
            </div>
            {/* App shell */}
            <div className="flex" style={{ height: 440 }}>
              {/* Sidebar */}
              <div className="w-52 bg-slate-900 border-r border-white/5 flex-shrink-0 flex flex-col">
                <div className="p-4 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black">SM</div>
                    <div>
                      <p className="text-xs font-bold text-white leading-none">St. Mary's School</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">2024/2025 Session</p>
                    </div>
                  </div>
                </div>
                <nav className="p-2 flex-1 space-y-0.5 overflow-hidden">
                  {[
                    { label: "Dashboard", active: true },
                    { label: "Students" }, { label: "Attendance" },
                    { label: "Exams & Marks" }, { label: "Fee Management" },
                    { label: "Staff & Payroll" }, { label: "Library" },
                    { label: "Reports" }, { label: "Settings" },
                  ].map(item => (
                    <div key={item.label} className={`px-3 py-1.5 rounded-md text-[11px] font-medium ${item.active ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
                      {item.label}
                    </div>
                  ))}
                </nav>
                <div className="p-3 border-t border-white/5">
                  <div className="flex items-center gap-2 px-2 py-1.5">
                    <div className="w-7 h-7 rounded-full bg-indigo-500/30 flex items-center justify-center text-[10px] font-black text-indigo-300">PA</div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-300">Principal Admin</p>
                      <p className="text-[10px] text-slate-500">Super Admin</p>
                    </div>
                  </div>
                </div>
              </div>
              {/* Main content */}
              <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
                <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between flex-shrink-0">
                  <div>
                    <h2 className="text-sm font-bold text-gray-900">Dashboard</h2>
                    <p className="text-[10px] text-gray-400">Thursday, 5 June 2025</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-6 px-3 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-semibold flex items-center">+ Enrol Student</div>
                    <div className="w-7 h-7 rounded-full bg-gray-100" />
                  </div>
                </div>
                <div className="p-4 flex-1 overflow-hidden">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Total Students", value: "842",    change: "+12 this week",    color: "text-blue-600",    dot: "bg-blue-500"    },
                      { label: "Present Today",  value: "96%",    change: "+2% vs yesterday", color: "text-emerald-600", dot: "bg-emerald-500" },
                      { label: "Fees This Month",value: "₵48.2K", change: "+8% vs last month",color: "text-violet-600",  dot: "bg-violet-500"  },
                      { label: "Staff Members",  value: "64",     change: "All active",       color: "text-amber-600",   dot: "bg-amber-500"   },
                    ].map(s => (
                      <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.dot} mb-2`} />
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{s.label}</p>
                        <p className="text-xl font-black text-gray-900 mt-0.5 leading-none">{s.value}</p>
                        <p className={`text-[9px] font-semibold mt-1 ${s.color}`}>{s.change}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-3.5">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-[11px] font-bold text-gray-800">Monthly Fee Collection</p>
                        <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">2024/2025</span>
                      </div>
                      <div className="flex items-end gap-1.5 h-20">
                        {[
                          { month: "Jan", pct: 60 }, { month: "Feb", pct: 45 },
                          { month: "Mar", pct: 82 }, { month: "Apr", pct: 71 },
                          { month: "May", pct: 93 }, { month: "Jun", pct: 56, hl: true },
                          { month: "Jul", pct: 30 },
                        ].map(b => (
                          <div key={b.month} className="flex-1 flex flex-col items-center gap-1">
                            <div className={`w-full rounded-t-sm ${"hl" in b && b.hl ? "bg-indigo-600" : "bg-indigo-200"}`} style={{ height: `${b.pct}%` }} />
                            <span className="text-[8px] text-gray-400">{b.month}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-3.5">
                      <p className="text-[11px] font-bold text-gray-800 mb-3">Recent Enrollments</p>
                      <div className="space-y-2.5">
                        {[
                          { name: "Kwame Asante", cls: "Grade 9A" }, { name: "Ama Boateng",  cls: "Grade 7B" },
                          { name: "Kofi Mensah",  cls: "Grade 11A"},{ name: "Akua Osei",    cls: "Grade 8C" },
                        ].map(s => (
                          <div key={s.name} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600 flex-shrink-0">{s.name[0]}</div>
                            <div>
                              <p className="text-[10px] font-semibold text-gray-800">{s.name}</p>
                              <p className="text-[9px] text-gray-400">{s.cls}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOGOS BAR ── */}
      <section className="bg-gray-900 border-y border-gray-800 py-8">
        <p className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-5">
          Trusted by schools across West Africa
        </p>
        <div className="flex items-center justify-center gap-10 flex-wrap px-6">
          {["St. Mary's Academy", "GoldCoast High", "Adinkra College", "Sunrise Primary", "Victory School", "Kumasi Preparatory"].map(name => (
            <span key={name} className="text-sm font-bold text-gray-600">{name}</span>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 text-center">
            {[
              { value: "2,500+", label: "Students managed",  sub: "Across all schools on the platform" },
              { value: "50+",    label: "Schools onboarded", sub: "From primary to senior high"        },
              { value: "20+",    label: "Built-in modules",  sub: "One platform, every feature"        },
              { value: "99.9%",  label: "Uptime guarantee",  sub: "Reliable, always-on infrastructure" },
            ].map(s => (
              <div key={s.label}>
                <p className="text-4xl font-black text-gray-900 tracking-tight">{s.value}</p>
                <p className="text-sm font-bold text-gray-700 mt-1">{s.label}</p>
                <p className="text-xs text-gray-400 mt-0.5 leading-snug">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">Built for real schools</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-xl mx-auto">Purpose-built for how academic institutions actually work — not a generic ERP in disguise.</p>
          </div>

          {/* Feature 1 — Students (real photo) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <Users className="h-3.5 w-3.5" /> Student Management
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Complete student lifecycle, end-to-end</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">From first admission enquiry to alumni — profiles, enrollment, session promotions, ID cards, guardian contacts and the full academic journey in one place.</p>
              <ul className="mt-7 space-y-3">
                {["Admission with custom intake forms", "Auto-generated, printable student ID cards", "Session-based enrollment & class promotion", "Parent & guardian portal access", "Full academic history per student"].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
              <Link href="/register" className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                See student management in action <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {/* Real photo — happy students */}
            <div className="relative rounded-3xl overflow-hidden" style={{ height: 440 }}>
              <Image
                src="/images/happy-students.jpg"
                alt="Happy students in an African school"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/75 via-blue-900/20 to-transparent" />
              {/* Floating stats */}
              <div className="absolute bottom-5 left-5 right-5 grid grid-cols-3 gap-2">
                {[{ v: "842", l: "Students" }, { v: "96%", l: "Attendance" }, { v: "78%", l: "Avg Score" }].map(s => (
                  <div key={s.l} className="bg-white/15 backdrop-blur-md border border-white/20 rounded-xl p-2.5 text-center">
                    <p className="text-white text-base font-black">{s.v}</p>
                    <p className="text-white/70 text-[10px] mt-0.5">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Feature 2 — Fees (CSS mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <div className="order-2 lg:order-1 bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-7 border border-violet-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fee Receipt</p>
                    <p className="text-xl font-black text-gray-900 mt-0.5">#RCP-2024-0842</p>
                  </div>
                  <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full">Paid</span>
                </div>
                <div className="space-y-2.5 mb-5">
                  {[
                    { fee: "Tuition Fee",   amount: "GH₵ 1,200.00", neg: false },
                    { fee: "ICT Levy",      amount: "GH₵ 80.00",    neg: false },
                    { fee: "Sports Fee",    amount: "GH₵ 50.00",    neg: false },
                    { fee: "Discount (10%)",amount: "– GH₵ 133.00", neg: true  },
                  ].map(f => (
                    <div key={f.fee} className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{f.fee}</span>
                      <span className={`font-semibold ${f.neg ? "text-emerald-600" : "text-gray-900"}`}>{f.amount}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">Total Paid</span>
                  <span className="text-xl font-black text-violet-600">GH₵ 1,197.00</span>
                </div>
                <p className="mt-3 text-[10px] text-gray-400 text-center">Collected by: Admin · 5 Jun 2025 · 10:32 AM</p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <DollarSign className="h-3.5 w-3.5" /> Fee Management
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Collect fees, issue receipts, track outstanding balances</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">From fee type setup to carry-forward balances — Novalss handles the full fee cycle so your accountants have complete control and real-time visibility.</p>
              <ul className="mt-7 space-y-3">
                {["Fee types, groups and discount management", "Per-student invoicing and collection", "Carry-forward unpaid balances across terms", "Printable receipts with school letterhead", "SMS & email reminders for outstanding fees"].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 3 — Exams (CSS mockup) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-5">
                <ClipboardList className="h-3.5 w-3.5" /> Exams & Results
              </div>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Mark entry, auto-grading and printed marksheets</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">Configure exam groups, enter marks, let the system calculate grades and rankings — then print admit cards before exams and marksheets after.</p>
              <ul className="mt-7 space-y-3">
                {["Configurable mark divisions and grade scales", "Bulk mark entry by subject and class", "Auto-calculated totals, grades and class rank", "Printable admit cards before exams", "Ranked, branded marksheets for parents"].map(item => (
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" /> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-7 border border-emerald-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50">
                  <p className="text-xs font-black text-gray-900 uppercase tracking-wide">Term 2 Results — Grade 9A</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">End of Term Examination · 2024/2025</p>
                </div>
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left px-5 py-2.5 text-gray-400 font-semibold">Student</th>
                      <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Total</th>
                      <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Grade</th>
                      <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Rank</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {[
                      { name: "Kwame Asante", total: 456, grade: "A",  rank: 1, g: "bg-emerald-100 text-emerald-700" },
                      { name: "Ama Boateng",  total: 441, grade: "A",  rank: 2, g: "bg-emerald-100 text-emerald-700" },
                      { name: "Kofi Mensah",  total: 418, grade: "B+", rank: 3, g: "bg-blue-100 text-blue-700"       },
                      { name: "Akua Osei",    total: 402, grade: "B",  rank: 4, g: "bg-blue-100 text-blue-700"       },
                    ].map(r => (
                      <tr key={r.name}>
                        <td className="px-5 py-2.5 font-semibold text-gray-800">{r.name}</td>
                        <td className="text-center px-3 py-2.5 text-gray-700 font-medium">{r.total}</td>
                        <td className="text-center px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.g}`}>{r.grade}</span>
                        </td>
                        <td className="text-center px-3 py-2.5 font-black text-gray-900">#{r.rank}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* All modules pill grid */}
          <div className="mt-16 bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">And 17 more modules included in every plan</p>
            <div className="flex flex-wrap justify-center gap-2.5">
              {["Attendance","Timetable","Library","Transport","Hostel","Inventory","Payroll","Online Exams","Homework","Lesson Plans","Front Office","Notice Board","Internal Chat","Alumni","Leave Management","Reports & Analytics","ID Cards"].map(m => (
                <span key={m} className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3.5 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — real photo background ── */}
      <section id="how-it-works" className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/students-laptops.jpg"
            alt="Students working on laptops"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-slate-950/88" />
        </div>
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Quick Setup</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Your school live in 3 steps</h2>
            <p className="mt-3 text-slate-400">No technical knowledge needed. No installation. Just sign up and go.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
            {[
              { step: "01", color: "text-indigo-400", title: "Register your school",      desc: "Enter your school name, logo and admin credentials. Your isolated subdomain is created instantly." },
              { step: "02", color: "text-violet-400", title: "Configure classes & staff", desc: "Add your academic year, classes, sections, subjects, teachers and fee structures — guided step by step." },
              { step: "03", color: "text-purple-400", title: "Enrol students",            desc: "Admit students individually or via bulk import. Parents automatically receive their own login." },
            ].map(s => (
              <div key={s.step}>
                <p className={`text-7xl font-black ${s.color} opacity-20 leading-none`}>{s.step}</p>
                <h3 className="text-lg font-bold text-white mt-2">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">From schools like yours</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Administrators love it</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { name: "Mrs. Adjoa Mensah", role: "Principal, GoldCoast Academy",  initial: "AM", color: "bg-blue-600",
                quote: "Before Novalss, we used spreadsheets for everything. Now our accountant processes a full term's fees in one afternoon. The time saving alone pays for the subscription." },
              { name: "Mr. Kojo Amponsah", role: "IT Admin, Adinkra College",     initial: "KA", color: "bg-violet-600",
                quote: "The multi-tenant architecture is exactly what we needed for our group of schools. Each campus is isolated but I can oversee all of them from one super-admin account." },
              { name: "Mrs. Efua Asante",  role: "Headmistress, Sunrise Primary", initial: "EA", color: "bg-emerald-600",
                quote: "Parents can check their child's attendance and results from their phones. Calls to the school office dropped by 60%. It's changed how we relate to parents." },
            ].map(t => (
              <div key={t.name} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex flex-col">
                <div className="flex gap-0.5 mb-5">
                  {[1,2,3,4,5].map(i => <Star key={i} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed flex-1">"{t.quote}"</p>
                <div className="mt-6 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.color} flex items-center justify-center text-sm font-black text-white flex-shrink-0`}>{t.initial}</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Start free. Grow with us.</h2>
            <p className="mt-3 text-gray-500 text-lg">All plans include every module. No add-ons, no hidden fees.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {[
              {
                name: "Starter", price: "Free", period: "14-day trial", desc: "Try every feature with no commitment", highlight: false,
                features: ["Up to 100 students", "5 staff accounts", "All 20+ modules included", "Email support"],
                cta: "Start free trial",
              },
              {
                name: "Growth", price: "$29", period: "/ month", desc: "For schools with up to 500 students", highlight: true, badge: "Most popular",
                features: ["Up to 500 students", "Unlimited staff accounts", "All modules + full reports", "Priority email & chat support", "CSV & PDF exports", "Custom school branding"],
                cta: "Get started",
              },
              {
                name: "Enterprise", price: "Custom", period: "", desc: "For large schools and school groups", highlight: false,
                features: ["Unlimited students", "Multi-school management", "Dedicated support manager", "Custom SLA & uptime guarantee", "API access & full data exports"],
                cta: "Contact us",
              },
            ].map(plan => (
              <div key={plan.name}
                   className={`relative rounded-2xl p-7 flex flex-col border ${plan.highlight ? "bg-slate-950 text-white border-indigo-500 shadow-2xl shadow-indigo-900/30 -mt-2" : "bg-white border-gray-200"}`}>
                {"badge" in plan && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-black px-4 py-0.5 rounded-full whitespace-nowrap">{plan.badge}</div>
                )}
                <p className={`text-xs font-black uppercase tracking-widest ${plan.highlight ? "text-indigo-400" : "text-gray-400"}`}>{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-slate-400" : "text-gray-400"}`}>{plan.period}</span>
                </div>
                <p className={`mt-1 text-sm ${plan.highlight ? "text-slate-400" : "text-gray-500"}`}>{plan.desc}</p>
                <ul className="mt-7 space-y-3 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight ? "text-indigo-400" : "text-emerald-500"}`} />
                      <span className={plan.highlight ? "text-slate-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors ${plan.highlight ? "bg-indigo-600 text-white hover:bg-indigo-500" : "bg-gray-900 text-white hover:bg-gray-700"}`}>
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Questions? Answered.</h2>
          </div>
          <div className="space-y-3">
            {[
              { q: "How quickly can my school get started?",
                a: "Under 2 minutes. Register with your school name and admin credentials and your school is live at yourschool.novalss.com immediately — no installation, no technical setup." },
              { q: "Is our data completely isolated from other schools?",
                a: "Yes. Novalss uses a multi-tenant architecture where every school runs in its own isolated database schema. There is absolutely no data sharing between schools on the platform." },
              { q: "Can students and parents also use the system?",
                a: "Yes. Students can view their results, timetable, attendance and fee status. Parents can monitor their child's progress and receive notifications about fees, attendance and events." },
              { q: "What roles does the system support?",
                a: "Seven built-in roles: Super Admin, Admin, Teacher, Accountant, Librarian, Student and Parent — each with granular route-level access control. No extra configuration required." },
              { q: "Can I export and print reports?",
                a: "Yes. All reports support CSV export. Fee receipts, ID cards, marksheets and admit cards are print-ready with your school's branding and letterhead." },
            ].map(({ q, a }) => (
              <details key={q} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-bold text-gray-900 text-sm">
                  {q}
                  <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 ml-4 group-open:rotate-90 transition-transform duration-200" />
                </summary>
                <div className="px-6 pb-5 pt-3 text-sm text-gray-500 leading-relaxed border-t border-gray-100">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA — real photo background ── */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/images/school-window.jpg"
            alt="Children at school in Uganda"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-slate-950/85" />
        </div>
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-7">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            Ready to modernise<br className="hidden sm:block" /> your school?
          </h2>
          <p className="mt-5 text-slate-400 text-lg max-w-xl mx-auto">Join 50+ schools already running on Novalss. No contract, no credit card, no technical setup.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-900/50">
              Get started free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 text-slate-300 border border-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
              Sign in to your school
            </Link>
          </div>
          <p className="mt-5 text-slate-500 text-sm">Photo: Bill Wegener & Emmanuel Ikwuegbu / Unsplash</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-16 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-base font-black text-white">Novalss</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Complete school management for modern educational institutions across Africa.</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-2.5">
                {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h]) => (
                  <li key={l}><a href={h} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Modules</p>
              <ul className="space-y-2.5">
                {["Students","Fee Management","Exams & Marks","Staff & Payroll","Library"].map(l => (
                  <li key={l}><a href="#features" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Account</p>
              <ul className="space-y-2.5">
                {[["Get started free","/register"],["Sign in","/sign-in"]].map(([l,h]) => (
                  <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <div className="flex items-center gap-6">
              {["Privacy Policy","Terms of Service"].map(l => (
                <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
