import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, CheckCircle2, Star, ChevronRight,
  Users, DollarSign, ClipboardList, XCircle,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="text-base font-extrabold text-gray-900 tracking-tight">Novalss</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8">
              {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h]) => (
                <a key={l} href={h} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-3 py-2 transition-colors">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors">
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative bg-slate-950 overflow-hidden" style={{ paddingTop: 64 }}>
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)", backgroundSize: "30px 30px" }} />
        <div className="absolute -top-40 left-1/4 w-[800px] h-[600px] bg-indigo-700/20 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Left — copy */}
            <div className="pb-20">
              <div className="inline-flex items-center gap-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                50+ schools running on Novalss
              </div>

              <h1 className="text-5xl lg:text-6xl font-black text-white leading-[1.04] tracking-tight">
                Stop managing<br />your school across<br />
                <span className="text-indigo-400">spreadsheets.</span>
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-lg">
                Students, fees, exams, attendance, staff and payroll — all in one platform.
                Your school gets its own subdomain and goes live in under 2 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-indigo-500 transition-colors shadow-xl shadow-indigo-900/40">
                  Start free — no card needed <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-300 px-7 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
                  Sign in to your school
                </Link>
              </div>

              <div className="flex flex-wrap gap-5 mt-8">
                {["No credit card required", "14-day free trial", "All 20+ modules included"].map(t => (
                  <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" /> {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — real classroom photo */}
            <div className="hidden lg:flex items-end justify-center self-end">
              <div className="relative w-full" style={{ maxWidth: 480 }}>
                {/* Floating UI card — top right */}
                <div className="absolute top-6 -right-4 z-10 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Present today</p>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-0.5">96%</p>
                  <div className="flex items-center gap-1 mt-1.5">
                    <div className="h-1.5 w-24 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: "96%" }} />
                    </div>
                    <span className="text-[10px] text-emerald-600 font-bold">+2%</span>
                  </div>
                </div>

                {/* Floating UI card — bottom left */}
                <div className="absolute bottom-16 -left-6 z-10 bg-white rounded-2xl shadow-2xl px-4 py-3 border border-gray-100">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Fees collected</p>
                  <p className="text-xl font-black text-gray-900 leading-none mt-0.5">GH₵ 48,200</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-1">↑ 8% this month</p>
                </div>

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/classroom-girl.jpg"
                  alt="Student in classroom"
                  className="w-full rounded-t-3xl object-cover object-top"
                  style={{ height: 520 }}
                />
                <div className="absolute inset-0 rounded-t-3xl" style={{ background: "linear-gradient(to top, rgba(2,6,23,0.5) 0%, transparent 50%)" }} />
              </div>
            </div>
          </div>

          {/* ── DASHBOARD STRIP ── */}
          <div className="mt-16 rounded-t-2xl border border-white/10 overflow-hidden"
               style={{ boxShadow: "0 -20px 80px rgba(99,102,241,0.15)" }}>
            <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-white/8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500" /><div className="w-3 h-3 rounded-full bg-amber-400" /><div className="w-3 h-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex-1 max-w-xs mx-auto bg-slate-900 rounded px-3 py-1 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] text-slate-400 font-mono">stmarys.novalss.com/dashboard</span>
              </div>
            </div>
            <div className="flex" style={{ height: 380 }}>
              {/* Sidebar */}
              <div className="w-48 bg-slate-900 border-r border-white/5 flex-shrink-0 flex flex-col">
                <div className="p-3.5 border-b border-white/5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black">SM</div>
                    <div><p className="text-xs font-bold text-white leading-none">St. Mary's School</p><p className="text-[10px] text-slate-500 mt-0.5">2024/2025</p></div>
                  </div>
                </div>
                <nav className="p-2 flex-1 space-y-0.5">
                  {[{l:"Dashboard",a:true},{l:"Students"},{l:"Attendance"},{l:"Exams & Marks"},{l:"Fee Management"},{l:"Staff & Payroll"},{l:"Library"},{l:"Reports"}].map(item=>(
                    <div key={item.l} className={`px-3 py-1.5 rounded-md text-[11px] font-medium ${item.a?"bg-indigo-600 text-white":"text-slate-400"}`}>{item.l}</div>
                  ))}
                </nav>
              </div>
              {/* Content */}
              <div className="flex-1 bg-gray-50 overflow-hidden flex flex-col">
                <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between">
                  <div><p className="text-sm font-bold text-gray-900">Dashboard</p><p className="text-[10px] text-gray-400">Thursday, 5 June 2025</p></div>
                  <div className="h-6 px-3 bg-indigo-50 text-indigo-600 rounded text-[10px] font-semibold flex items-center">+ Enrol Student</div>
                </div>
                <div className="p-4">
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[{l:"Total Students",v:"842",c:"text-blue-600",d:"bg-blue-500",s:"+12 this week"},{l:"Present Today",v:"96%",c:"text-emerald-600",d:"bg-emerald-500",s:"+2% vs yesterday"},{l:"Fees This Month",v:"₵48.2K",c:"text-violet-600",d:"bg-violet-500",s:"+8% vs last month"},{l:"Staff Members",v:"64",c:"text-amber-600",d:"bg-amber-500",s:"All active"}].map(s=>(
                      <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-3">
                        <div className={`w-1.5 h-1.5 rounded-full ${s.d} mb-2`}/>
                        <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{s.l}</p>
                        <p className="text-xl font-black text-gray-900 leading-none mt-0.5">{s.v}</p>
                        <p className={`text-[9px] font-semibold mt-1 ${s.c}`}>{s.s}</p>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-5 gap-3">
                    <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-3">
                      <div className="flex items-center justify-between mb-2"><p className="text-[11px] font-bold text-gray-800">Monthly Fee Collection</p><span className="text-[9px] text-gray-400">2024/2025</span></div>
                      <div className="flex items-end gap-1.5 h-16">
                        {[{m:"Jan",p:60},{m:"Feb",p:45},{m:"Mar",p:82},{m:"Apr",p:71},{m:"May",p:93},{m:"Jun",p:56,h:true},{m:"Jul",p:30}].map(b=>(
                          <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
                            <div className={"w-full rounded-t-sm "+("h" in b&&b.h?"bg-indigo-600":"bg-indigo-200")} style={{height:`${b.p}%`}}/>
                            <span className="text-[8px] text-gray-400">{b.m}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-3">
                      <p className="text-[11px] font-bold text-gray-800 mb-2">Recent Enrollments</p>
                      <div className="space-y-2">
                        {[{n:"Kwame Asante",c:"Grade 9A"},{n:"Ama Boateng",c:"Grade 7B"},{n:"Kofi Mensah",c:"Grade 11A"},{n:"Akua Osei",c:"Grade 8C"}].map(s=>(
                          <div key={s.n} className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[8px] font-black text-indigo-600 shrink-0">{s.n[0]}</div>
                            <div><p className="text-[10px] font-semibold text-gray-800">{s.n}</p><p className="text-[9px] text-gray-400">{s.c}</p></div>
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

      {/* ── METRICS BAR ── */}
      <section className="bg-slate-900 border-y border-slate-800 py-6">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-800">
            {[{v:"2,500+",l:"Students managed"},{v:"50+",l:"Schools onboarded"},{v:"20+",l:"Built-in modules"},{v:"99.9%",l:"Uptime guarantee"}].map(s=>(
              <div key={s.l} className="text-center px-6 py-2">
                <p className="text-2xl font-black text-white">{s.v}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="py-24 bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sound familiar?</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Running a school is hard enough.<br/>Your tools shouldn't make it harder.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-16">
            {[
              { icon: DollarSign,   color: "text-rose-500 bg-rose-50", title: "Fee collection is a monthly nightmare",    body: "Chasing parents on WhatsApp. Lost payment receipts. No idea who owes what. Your accountant spends more time searching than collecting." },
              { icon: ClipboardList,color: "text-amber-600 bg-amber-50",title: "Results day means hours of manual work",   body: "Entering marks into Excel. Manually ranking students. Printing class lists. A process that should take minutes takes your teachers all week." },
              { icon: Users,        color: "text-blue-600 bg-blue-50",  title: "Attendance is still on paper registers",  body: "Paper registers pile up. No way to spot a student missing for 3 days. No reports. No parent notifications. No data." },
            ].map(p => (
              <div key={p.title} className="border border-gray-200 rounded-2xl p-6 bg-white">
                <div className={`w-10 h-10 rounded-xl ${p.color} flex items-center justify-center mb-4`}>
                  <p.icon className="h-5 w-5" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{p.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
          {/* Bridge */}
          <div className="text-center">
            <p className="text-lg font-bold text-gray-900">Novalss replaces all of that — in one platform your entire school staff can use from day one.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Platform Features</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Everything your school needs.<br/>Nothing it doesn't.</h2>
          </div>

          {/* Feature 1 — Fees FIRST (biggest pain point) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            {/* Receipt mockup */}
            <div className="bg-gradient-to-br from-violet-50 to-indigo-50 rounded-3xl p-8 border border-violet-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Fee Receipt</p>
                    <p className="text-xl font-black text-gray-900 mt-0.5">#RCP-2025-0842</p>
                    <p className="text-xs text-gray-400 mt-0.5">Kwame Asante · Grade 9A</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Paid ✓</span>
                </div>
                <div className="space-y-2.5 mb-5">
                  {[{f:"Tuition Fee",a:"GH₵ 1,200.00",neg:false},{f:"ICT Levy",a:"GH₵ 80.00",neg:false},{f:"Sports Fee",a:"GH₵ 50.00",neg:false},{f:"Discount (10%)",a:"– GH₵ 133.00",neg:true}].map(r=>(
                    <div key={r.f} className="flex justify-between text-sm">
                      <span className="text-gray-500">{r.f}</span>
                      <span className={`font-semibold ${r.neg?"text-emerald-600":"text-gray-900"}`}>{r.a}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4 flex justify-between">
                  <span className="text-sm font-bold text-gray-900">Total Paid</span>
                  <span className="text-xl font-black text-violet-600">GH₵ 1,197.00</span>
                </div>
                <p className="text-[10px] text-gray-400 text-center mt-3">Collected by: Admin · 5 Jun 2025 · 10:32 AM</p>
              </div>
              {/* Outstanding list */}
              <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-bold text-gray-800">Outstanding Balances</p>
                  <span className="text-xs text-rose-600 font-bold">12 students</span>
                </div>
                {[{n:"Ama Boateng",a:"GH₵ 400"},{n:"Kofi Mensah",a:"GH₵ 1,200"},{n:"Akua Osei",a:"GH₵ 250"}].map(s=>(
                  <div key={s.n} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-700 font-medium">{s.n}</span>
                    <span className="text-xs font-bold text-rose-600">{s.a}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-4">Fee Management</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Know exactly who has paid. Who owes. And how much.</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">No more WhatsApp chasing. No more lost receipts. Every payment is recorded, every balance visible, every receipt printable in one click.</p>
              <ul className="mt-7 space-y-3">
                {["Fee types, groups and discount management","Per-student invoicing with automatic carry-forward","Printable receipts with your school letterhead","Outstanding balance dashboard — always up to date","SMS & email reminders for unpaid fees"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 mt-0.5 shrink-0"/> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature 2 — Students with real photo */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-4">Student Management</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">Every student's full story, one click away.</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">From admission to graduation — profiles, session enrollment, class promotion, ID cards, attendance history and exam results, all linked to a single student record.</p>
              <ul className="mt-7 space-y-3">
                {["Custom admission forms and student intake","Auto-generated printable ID cards","Session-based enrollment and class promotion","Parent portal — results, fees, attendance at a glance","Complete academic history across all sessions"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0"/> {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* Real photo — student writing */}
            <div className="relative rounded-3xl overflow-hidden" style={{ height: 480 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/student-writing.jpg" alt="African student writing in classroom" className="w-full h-full object-cover object-top" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(15,23,42,0.75) 0%, transparent 55%)" }} />
              <div className="absolute bottom-6 left-6 right-6">
                <div className="grid grid-cols-3 gap-2">
                  {[{v:"842",l:"Enrolled"},{v:"96%",l:"Attendance"},{v:"78%",l:"Avg Score"}].map(s=>(
                    <div key={s.l} className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-2.5 text-center">
                      <p className="text-white font-black text-base">{s.v}</p>
                      <p className="text-white/60 text-[10px] mt-0.5">{s.l}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 — Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-16">
            {/* Results table */}
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-4">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-wide">Term 2 Results — Grade 9A</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">2024/2025 · Auto-calculated by Novalss</p>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-700 font-bold px-2.5 py-1 rounded-full">Published</span>
                </div>
                <table className="w-full text-xs">
                  <thead><tr className="bg-gray-50">
                    <th className="text-left px-5 py-2.5 text-gray-400 font-semibold">Student</th>
                    <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Total</th>
                    <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Grade</th>
                    <th className="text-center px-3 py-2.5 text-gray-400 font-semibold">Rank</th>
                  </tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {[{n:"Kwame Asante",t:456,g:"A",r:1,gc:"bg-emerald-100 text-emerald-700"},{n:"Ama Boateng",t:441,g:"A",r:2,gc:"bg-emerald-100 text-emerald-700"},{n:"Kofi Mensah",t:418,g:"B+",r:3,gc:"bg-blue-100 text-blue-700"},{n:"Akua Osei",t:402,g:"B",r:4,gc:"bg-blue-100 text-blue-700"}].map(r=>(
                      <tr key={r.n}>
                        <td className="px-5 py-2.5 font-semibold text-gray-800">{r.n}</td>
                        <td className="text-center px-3 py-2.5 text-gray-700 font-medium">{r.t}</td>
                        <td className="text-center px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.gc}`}>{r.g}</span></td>
                        <td className="text-center px-3 py-2.5 font-black text-gray-900">#{r.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-white rounded-xl border border-gray-100 p-3">
                <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                <span>Before Novalss: 3 days of manual Excel work to produce this table.</span>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-4">Exams & Results</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">From mark entry to ranked marksheets — in minutes, not days.</h3>
              <p className="mt-4 text-gray-500 leading-relaxed">Set up your exam groups, enter marks by subject or bulk import, and let Novalss calculate totals, grades and rankings automatically. Print admit cards before. Print marksheets after.</p>
              <ul className="mt-7 space-y-3">
                {["Configurable grade scales and mark divisions","Bulk mark entry by subject and class","Auto-calculated totals, grades and class rankings","Printable admit cards with student photos","Branded, ranked marksheets ready to hand to parents"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"/> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* All modules pill */}
          <div className="mt-16 bg-gray-50 rounded-3xl p-8 border border-gray-200">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">17 more modules included at no extra cost</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Attendance","Timetable","Library","Transport","Hostel","Inventory","Payroll","Online Exams","Homework","Lesson Plans","Front Office","Notice Board","Internal Chat","Alumni","Leave Management","Reports & Analytics","Staff ID Cards"].map(m=>(
                <span key={m} className="bg-white border border-gray-200 text-gray-600 text-xs font-medium px-3.5 py-1.5 rounded-full">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="overflow-hidden border-y border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left — dark, stats */}
          <div className="bg-slate-950 px-10 lg:px-16 py-20 flex flex-col justify-center">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5">Why school owners choose Novalss</p>
            <h2 className="text-4xl font-black text-white tracking-tight leading-tight">
              "We saved 3 days of admin work every single term."
            </h2>
            <p className="mt-5 text-slate-400 leading-relaxed">
              That's what principals tell us when they switch from spreadsheets to Novalss. Fewer errors. Happier staff. Parents who actually trust the numbers.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              {[
                {v:"80%",   l:"Reduction in fee-collection time"},
                {v:"3 days",l:"Saved per term on result processing"},
                {v:"60%",   l:"Fewer parent enquiry calls"},
                {v:"100%",  l:"Of schools stay beyond the free trial"},
              ].map(s=>(
                <div key={s.l}>
                  <p className="text-4xl font-black text-indigo-400">{s.v}</p>
                  <p className="text-sm text-slate-400 mt-1 leading-snug">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors">
                Start free today <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Right — white, girl floats cleanly on transparent PNG */}
          <div className="bg-white flex items-end justify-center pt-12 lg:pt-0" style={{ minHeight: 520 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/school-girl-books.png"
              alt="Happy African school girl holding books"
              className="object-contain object-bottom w-auto"
              style={{ maxHeight: 520 }}
            />
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="relative bg-slate-950 py-28 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.03) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-3">Quick Setup</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Your school, live in 3 steps.</h2>
            <p className="mt-3 text-slate-400">No IT team. No installation. No waiting.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-12">
            {[
              {step:"01",col:"text-indigo-400",title:"Register your school",     desc:"Enter school name, logo and admin email. Your school gets its own subdomain — yourschool.novalss.com — instantly."},
              {step:"02",col:"text-violet-400",title:"Set up classes and staff",  desc:"Add your academic sessions, classes, sections, subjects, fee types and staff accounts. Takes about 20 minutes."},
              {step:"03",col:"text-purple-400",title:"Enrol your students",       desc:"Add students individually or bulk-import from a spreadsheet. Parents receive login access automatically."},
            ].map(s=>(
              <div key={s.step}>
                <p className={`text-7xl font-black ${s.col} opacity-20 leading-none mb-3`}>{s.step}</p>
                <h3 className="text-lg font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS — school-boy photo ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            {/* Left — photo + heading (2 cols) */}
            <div className="lg:col-span-2">
              {/* school-boy floats naturally on white background */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/school-boy.jpg"
                alt="African school boy ready to learn"
                className="w-full object-contain rounded-3xl"
                style={{ maxHeight: 400 }}
              />
              <div className="mt-6">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Real feedback</p>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Principals. Admins. Teachers.<br/>They all love it.</h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">Schools across West Africa switched from spreadsheets and WhatsApp to Novalss. Here's what they say.</p>
              </div>
            </div>
            {/* Right — 3 testimonial cards (3 cols) */}
            <div className="lg:col-span-3 space-y-4">
              {[
                {name:"Mrs. Adjoa Mensah",role:"Principal, GoldCoast Academy, Accra",initial:"AM",color:"bg-blue-600",stars:5,
                  quote:"Before Novalss we spent the first two weeks of every term chasing fee payments. Now our accountant closes the books in a single day. I genuinely cannot believe how much time we were wasting."},
                {name:"Mr. Kojo Amponsah",role:"IT Administrator, Adinkra College",initial:"KA",color:"bg-violet-600",stars:5,
                  quote:"I manage 3 schools for our group. Each campus has completely isolated data but I can view everything from one login. The multi-tenant setup is exactly what we needed and it just works."},
                {name:"Mrs. Efua Asante",role:"Headmistress, Sunrise Primary, Kumasi",initial:"EA",color:"bg-emerald-600",stars:5,
                  quote:"Parents used to call the office 20 times a day asking about results and fees. Since we gave them the parent portal those calls have almost stopped. Our staff are less stressed. It's been a genuine change."},
              ].map(t=>(
                <div key={t.name} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-4">
                    {[1,2,3,4,5].map(i=><Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/>)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">"{t.quote}"</p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-black text-white shrink-0`}>{t.initial}</div>
                    <div><p className="text-sm font-bold text-gray-900">{t.name}</p><p className="text-xs text-gray-400">{t.role}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-gray-50 border-y border-gray-200 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Transparent, simple pricing.</h2>
            <p className="mt-3 text-gray-500 text-lg">Every plan includes every module. No add-ons. No surprises.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {[
              {name:"Starter",price:"Free",period:"14-day trial",desc:"Try the full platform — no commitment",highlight:false,
               features:["Up to 100 students","5 staff accounts","All 20+ modules","Email support"],cta:"Start free trial"},
              {name:"Growth",price:"$29",period:"/ month",desc:"For schools with up to 500 students",highlight:true,badge:"Most popular",
               features:["Up to 500 students","Unlimited staff accounts","All modules + full reports","Priority support","CSV & PDF exports","Custom school branding"],cta:"Get started"},
              {name:"Enterprise",price:"Custom",period:"",desc:"For large schools and school groups",highlight:false,
               features:["Unlimited students","Multi-school management","Dedicated support manager","Custom SLA","API access"],cta:"Contact us"},
            ].map(plan=>(
              <div key={plan.name} className={`relative rounded-2xl p-7 flex flex-col border ${plan.highlight?"bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-900/20 -mt-3":"bg-white border-gray-200"}`}>
                {"badge" in plan && plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-black px-4 py-0.5 rounded-full whitespace-nowrap">{plan.badge}</div>
                )}
                <p className={`text-xs font-black uppercase tracking-widest ${plan.highlight?"text-indigo-400":"text-gray-400"}`}>{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight?"text-slate-400":"text-gray-400"}`}>{plan.period}</span>
                </div>
                <p className={`mt-1 text-sm ${plan.highlight?"text-slate-400":"text-gray-500"}`}>{plan.desc}</p>
                <ul className="mt-7 space-y-3 flex-1">
                  {plan.features.map(f=>(
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.highlight?"text-indigo-400":"text-emerald-500"}`}/>
                      <span className={plan.highlight?"text-slate-300":"text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors ${plan.highlight?"bg-indigo-600 text-white hover:bg-indigo-500":"bg-gray-900 text-white hover:bg-gray-700"}`}>
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5"/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-3">
            {[
              {q:"How long does setup actually take?",a:"Most schools are fully live — with classes, sections, fee types and staff accounts configured — within 30 minutes. Your subdomain (yourschool.novalss.com) is created the moment you register."},
              {q:"Is our school's data private and separate from others?",a:"Yes. Every school runs in its own isolated database schema on Novalss. There is no shared data between schools whatsoever. Your information is only visible to your own staff."},
              {q:"What roles can access the system?",a:"Seven built-in roles: Super Admin, Admin, Teacher, Accountant, Librarian, Student, and Parent. Each has granular route-level permissions so staff only see what they need to see."},
              {q:"Can parents and students log in?",a:"Yes. Students can view results, timetable, attendance and fee status. Parents can monitor their child's academic progress, see outstanding fees, and receive notifications. No extra setup required."},
              {q:"Can we print receipts, ID cards and marksheets?",a:"Yes. Fee receipts, student ID cards, admit cards and ranked marksheets are all print-ready with your school name, logo and branding."},
              {q:"What happens after the 14-day trial?",a:"Your data is safe. You can upgrade to a paid plan or export everything. We will never delete your data without warning."},
            ].map(({q,a})=>(
              <details key={q} className="group bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-bold text-gray-900 text-sm">
                  {q}
                  <ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-4 group-open:rotate-90 transition-transform duration-200"/>
                </summary>
                <div className="px-6 pb-5 pt-3 text-sm text-gray-500 leading-relaxed border-t border-gray-100">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-slate-950 py-28 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-4">Ready to make the switch?</p>
          <h2 className="text-5xl font-black text-white tracking-tight leading-tight">
            Your school.<br/>
            <span className="text-indigo-400">Your platform.</span><br/>
            Live in 2 minutes.
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-xl mx-auto">
            Join 50+ schools that stopped managing education in spreadsheets. Start your free trial — no credit card, no contract.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-black text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-900/50">
              Create your school now <ArrowRight className="h-5 w-5"/>
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 text-slate-300 border border-slate-700 px-8 py-4 rounded-xl font-semibold hover:bg-slate-800 transition-colors">
              Already have an account
            </Link>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 mt-8">
            {["No credit card","14-day free trial","All modules included","Cancel anytime"].map(t=>(
              <div key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0"/> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-gray-900 border-t border-gray-800 pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><GraduationCap className="h-4 w-4 text-white"/></div>
                <span className="text-base font-black text-white">Novalss</span>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Complete school management for educational institutions across Africa.</p>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Product</p>
              <ul className="space-y-2.5">
                {[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=>(
                  <li key={l}><a href={h} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Modules</p>
              <ul className="space-y-2.5">
                {["Students","Fee Management","Exams & Results","Staff & Payroll","Library"].map(l=>(
                  <li key={l}><a href="#features" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4">Account</p>
              <ul className="space-y-2.5">
                {[["Get started free","/register"],["Sign in","/sign-in"]].map(([l,h])=>(
                  <li key={l}><Link href={h} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy Policy","Terms of Service"].map(l=>(
                <a key={l} href="#" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
