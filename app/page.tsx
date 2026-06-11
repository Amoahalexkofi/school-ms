import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, CheckCircle2, Star, ChevronRight,
  DollarSign, ClipboardList, Users, XCircle,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white antialiased">

      {/* ───────────── NAV ───────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-white" />
              </div>
              <span className="font-black text-gray-900 text-base tracking-tight">Novalss</span>
            </Link>
            <div className="hidden lg:flex items-center gap-7">
              {[["Features","#features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=>(
                <a key={l} href={h} className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:block text-sm font-semibold text-gray-500 hover:text-gray-900 px-3 py-2 transition-colors">Sign in</Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25">
              Get started free <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ───────────── HERO ───────────── */}
      <section className="relative bg-slate-950 overflow-hidden" style={{ paddingTop: 64 }}>
        {/* dot grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.04) 1px,transparent 0)", backgroundSize:"32px 32px" }} />
        {/* ambient glow — top-right corner */}
        <div className="absolute -top-40 right-0 w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[130px] pointer-events-none" />
        {/* glow directly behind the girl */}
        <div className="absolute right-[12%] bottom-0 w-[380px] h-[640px] bg-indigo-500/20 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[700px] items-center gap-8 py-16 lg:py-0">

            {/* ── Left copy ── */}
            <div className="lg:py-24">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-slate-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                Trusted by 50+ schools across West Africa
              </div>

              <h1 className="text-[52px] lg:text-[64px] font-black text-white leading-[1.02] tracking-tight">
                Your school.<br />
                Fully managed.<br />
                <span className="text-indigo-400">One platform.</span>
              </h1>

              <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-md">
                Stop running your school on spreadsheets and WhatsApp groups. Novalss gives you students, fees, exams, attendance and staff — all in one place, live in 2 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-10">
                <Link href="/register" className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-4 rounded-xl font-bold text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/30">
                  Create your school free <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/sign-in" className="inline-flex items-center justify-center gap-2 border border-white/10 text-slate-300 px-7 py-4 rounded-xl font-semibold hover:bg-white/5 transition-colors">
                  Sign in
                </Link>
              </div>

              <div className="flex flex-wrap gap-5 mt-7">
                {["No credit card","14-day free trial","All modules included"].map(t=>(
                  <span key={t} className="flex items-center gap-1.5 text-sm text-slate-500">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* ── Right: transparent PNG girl, floating against dark ── */}
            <div className="hidden lg:flex items-end justify-center relative self-stretch">
              {/* Floating UI card — fee */}
              <div className="absolute top-16 left-0 z-10 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100 w-52">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Fees collected</p>
                <p className="text-2xl font-black text-gray-900">GH₵ 48,200</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">↑ 8% this month</span>
                </div>
              </div>
              {/* Floating UI card — attendance */}
              <div className="absolute top-1/3 right-4 z-10 bg-white rounded-2xl shadow-2xl p-4 border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Attendance today</p>
                <p className="text-2xl font-black text-gray-900">96%</p>
                <div className="h-1.5 w-28 bg-gray-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{width:"96%"}} />
                </div>
              </div>
              {/* Floating UI card — students */}
              <div className="absolute bottom-36 right-2 z-10 bg-white rounded-2xl shadow-xl px-4 py-2.5 border border-gray-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center"><Users className="h-4 w-4 text-blue-600"/></div>
                  <div>
                    <p className="text-base font-black text-gray-900 leading-none">842</p>
                    <p className="text-[10px] text-gray-400">Students enrolled</p>
                  </div>
                </div>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/school-girl-books.png"
                alt="School girl with books"
                className="relative z-0 object-contain object-bottom select-none"
                style={{
                  height: 680,
                  maxWidth: "100%",
                  filter: "drop-shadow(0 0 60px rgba(99,102,241,0.35)) drop-shadow(0 40px 80px rgba(99,102,241,0.15))",
                }}
              />
            </div>
          </div>

          {/* ── Dashboard mockup — 3D perspective ── */}
          <div className="pb-0" style={{ perspective: "1200px" }}>
            <div className="rounded-t-2xl overflow-hidden border border-white/10"
                 style={{ transform:"rotateX(4deg)", transformOrigin:"top center", boxShadow:"0 -20px 100px rgba(99,102,241,0.2), 0 0 0 1px rgba(255,255,255,0.05)" }}>
              {/* Browser chrome */}
              <div className="bg-slate-800 px-4 py-2.5 flex items-center gap-3 border-b border-white/8">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-500"/><div className="w-3 h-3 rounded-full bg-amber-400"/><div className="w-3 h-3 rounded-full bg-emerald-500"/>
                </div>
                <div className="flex-1 max-w-xs mx-auto bg-slate-900 rounded px-3 py-1 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[11px] text-slate-400 font-mono">stmarys.novalss.com</span>
                </div>
              </div>
              {/* App shell */}
              <div className="flex" style={{height:400}}>
                <div className="w-52 bg-slate-900 border-r border-white/5 flex-shrink-0 flex flex-col">
                  <div className="p-3.5 border-b border-white/5 flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-black">SM</div>
                    <div><p className="text-xs font-bold text-white leading-none">St. Mary's School</p><p className="text-[10px] text-slate-500 mt-0.5">2024/2025</p></div>
                  </div>
                  <nav className="p-2 flex-1 space-y-0.5">
                    {[{l:"Dashboard",a:true},{l:"Students"},{l:"Attendance"},{l:"Exams & Marks"},{l:"Fee Management"},{l:"Staff & Payroll"},{l:"Library"},{l:"Reports"}].map(item=>(
                      <div key={item.l} className={`px-3 py-1.5 rounded-md text-[11px] font-medium ${item.a?"bg-indigo-600 text-white":"text-slate-400"}`}>{item.l}</div>
                    ))}
                  </nav>
                </div>
                <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden">
                  <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
                    <div><p className="text-sm font-bold text-gray-900">Dashboard</p><p className="text-[10px] text-gray-400">Thursday, 5 June 2025</p></div>
                    <div className="h-7 px-3 bg-indigo-600 text-white rounded-lg text-[11px] font-bold flex items-center">+ Enrol Student</div>
                  </div>
                  <div className="p-4 flex-1">
                    <div className="grid grid-cols-4 gap-3 mb-4">
                      {[{l:"Total Students",v:"842",c:"text-blue-600",d:"bg-blue-500",s:"+12 this week"},{l:"Present Today",v:"96%",c:"text-emerald-600",d:"bg-emerald-500",s:"+2% yesterday"},{l:"Fees This Month",v:"₵48.2K",c:"text-violet-600",d:"bg-violet-500",s:"+8% last month"},{l:"Staff Members",v:"64",c:"text-amber-600",d:"bg-amber-500",s:"All active"}].map(s=>(
                        <div key={s.l} className="bg-white rounded-xl border border-gray-100 p-3">
                          <div className={`w-1.5 h-1.5 rounded-full ${s.d} mb-2`}/>
                          <p className="text-[9px] text-gray-400 font-semibold uppercase tracking-wide">{s.l}</p>
                          <p className="text-xl font-black text-gray-900 leading-none mt-0.5">{s.v}</p>
                          <p className={`text-[9px] font-semibold mt-1 ${s.c}`}>{s.s}</p>
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-5 gap-3">
                      <div className="col-span-3 bg-white rounded-xl border border-gray-100 p-3.5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-[11px] font-bold text-gray-800">Monthly Fee Collection</p>
                          <span className="text-[9px] text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full font-medium">2024/2025</span>
                        </div>
                        <div className="flex items-end gap-1.5 h-20">
                          {[{m:"Jan",p:60},{m:"Feb",p:45},{m:"Mar",p:82},{m:"Apr",p:71},{m:"May",p:93},{m:"Jun",p:56,h:true},{m:"Jul",p:30}].map(b=>(
                            <div key={b.m} className="flex-1 flex flex-col items-center gap-1">
                              <div className={"w-full rounded-t "+("h" in b&&b.h?"bg-indigo-600":"bg-indigo-200")} style={{height:`${b.p}%`}}/>
                              <span className="text-[8px] text-gray-400">{b.m}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="col-span-2 bg-white rounded-xl border border-gray-100 p-3.5">
                        <p className="text-[11px] font-bold text-gray-800 mb-3">Recent Enrollments</p>
                        <div className="space-y-2.5">
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
        </div>
      </section>

      {/* ───────────── LOGOS ───────────── */}
      <section className="bg-gray-950 border-b border-gray-800 py-6">
        <div className="max-w-6xl mx-auto px-6 flex flex-wrap items-center justify-center gap-10">
          {["St. Mary's Academy","GoldCoast High","Adinkra College","Sunrise Primary","Victory School","Kumasi Prep"].map(n=>(
            <span key={n} className="text-sm font-bold text-gray-600 hover:text-gray-400 transition-colors">{n}</span>
          ))}
        </div>
      </section>

      {/* ───────────── BEFORE / AFTER ───────────── */}
      <section className="py-20 bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-widest mb-10">Sound familiar?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Before */}
            <div className="bg-rose-50 border border-rose-100 rounded-2xl p-7">
              <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-5">Before Novalss</p>
              <ul className="space-y-3.5">
                {[
                  "Fee payments tracked in WhatsApp and exercise books",
                  "Results calculated manually in Excel every term",
                  "Attendance on paper registers — no reports, no alerts",
                  "Parents calling the office asking for information",
                  "No idea which students have outstanding balances",
                ].map(item=>(
                  <li key={item} className="flex items-start gap-3 text-sm text-rose-900">
                    <XCircle className="h-4 w-4 text-rose-400 mt-0.5 shrink-0"/>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            {/* After */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-7">
              <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-5">After Novalss</p>
              <ul className="space-y-3.5">
                {[
                  "Every payment recorded, receipts printed instantly",
                  "Marks entered once — grades, rankings, marksheets auto-generated",
                  "Attendance marked digitally, absent alerts sent automatically",
                  "Parents log in themselves to check results, fees and timetable",
                  "Outstanding balances visible at a glance — with reminders",
                ].map(item=>(
                  <li key={item} className="flex items-start gap-3 text-sm text-emerald-900">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"/>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── FEATURES ───────────── */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">What's inside</p>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 tracking-tight">Everything. Included. From day one.</h2>
            <p className="mt-4 text-gray-500 text-lg max-w-lg mx-auto">No add-ons. No per-module pricing. The full platform on every plan.</p>
          </div>

          {/* Fee Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <div className="space-y-2">
              <p className="text-xs font-bold text-violet-600 uppercase tracking-widest">Fee Management</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Know exactly who paid.<br/>Who owes. Right now.</h3>
              <p className="text-gray-500 leading-relaxed pt-2">Every pesewa tracked. Every receipt printable. Every outstanding balance visible in real time — with automatic reminders so your accountant stops chasing parents.</p>
              <ul className="pt-3 space-y-2.5">
                {["Fee types, groups and discount configuration","Per-student invoicing with automatic carry-forward","Printable receipts with your school letterhead","Outstanding balance dashboard — live, always accurate","SMS & email reminders for unpaid fees"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-violet-500 mt-0.5 shrink-0"/>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-3xl p-8 border border-violet-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fee Receipt</p>
                    <p className="text-xl font-black text-gray-900 mt-0.5">#RCP-2025-0842</p>
                    <p className="text-xs text-gray-400 mt-0.5">Kwame Asante · Grade 9A</p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 text-xs font-black px-3 py-1 rounded-full">Paid ✓</span>
                </div>
                {[{f:"Tuition Fee",a:"GH₵ 1,200.00",neg:false},{f:"ICT Levy",a:"GH₵ 80.00",neg:false},{f:"Discount (10%)",a:"– GH₵ 128.00",neg:true}].map(r=>(
                  <div key={r.f} className="flex justify-between text-sm py-1.5 border-b border-gray-50 last:border-0">
                    <span className="text-gray-500">{r.f}</span><span className={`font-semibold ${r.neg?"text-emerald-600":"text-gray-900"}`}>{r.a}</span>
                  </div>
                ))}
                <div className="flex justify-between mt-3 pt-3 border-t">
                  <span className="text-sm font-bold">Total Paid</span>
                  <span className="text-xl font-black text-violet-600">GH₵ 1,152.00</span>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-4">
                <div className="flex justify-between mb-3"><p className="text-xs font-bold text-gray-800">Outstanding balances</p><span className="text-xs text-rose-600 font-bold">12 students</span></div>
                {[{n:"Ama Boateng",a:"GH₵ 400"},{n:"Kofi Mensah",a:"GH₵ 1,200"},{n:"Akua Osei",a:"GH₵ 250"}].map(s=>(
                  <div key={s.n} className="flex justify-between py-1.5 border-b border-gray-50 last:border-0 text-xs">
                    <span className="font-medium text-gray-700">{s.n}</span><span className="font-bold text-rose-600">{s.a}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Student Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-28">
            <div className="relative rounded-3xl overflow-hidden order-2 lg:order-1" style={{height:480}}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/student-writing.jpg" alt="Student writing in class" className="w-full h-full object-cover object-top"/>
              <div className="absolute inset-0" style={{background:"linear-gradient(to top,rgba(15,23,42,0.8) 0%,rgba(15,23,42,0.1) 50%,transparent 100%)"}}/>
              <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-2">
                {[{v:"842",l:"Students"},{v:"96%",l:"Attendance"},{v:"78%",l:"Avg Score"}].map(s=>(
                  <div key={s.l} className="bg-white/15 backdrop-blur border border-white/20 rounded-xl p-3 text-center">
                    <p className="text-white font-black text-lg leading-none">{s.v}</p>
                    <p className="text-white/60 text-[10px] mt-1">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-2">
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Student Management</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Every student's full story.<br/>One click away.</h3>
              <p className="text-gray-500 leading-relaxed pt-2">From the day they walk in to the day they graduate — profiles, session history, ID cards, class promotions, guardian contacts and the full academic record, all in one place.</p>
              <ul className="pt-3 space-y-2.5">
                {["Custom admission forms and intake workflows","Auto-generated printable student ID cards","Session-based enrollment and automatic class promotion","Parent portal — results, fees and timetable in one login","Complete academic history across every session"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0"/>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Exams */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-2">
              <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Exams & Results</p>
              <h3 className="text-3xl font-black text-gray-900 tracking-tight">Marks in. Ranked marksheets out.<br/>No Excel required.</h3>
              <p className="text-gray-500 leading-relaxed pt-2">Enter marks by subject, let Novalss calculate totals, grades and class rankings instantly. Print admit cards before exams. Print branded marksheets after. Done.</p>
              <ul className="pt-3 space-y-2.5">
                {["Configurable grade scales and mark divisions","Bulk mark entry by subject and class","Auto-calculated totals, grades and class rankings","Printable admit cards with student details","Branded ranked marksheets, ready for parents"].map(item=>(
                  <li key={item} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0"/>{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 border border-emerald-100">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-black text-gray-900 uppercase tracking-wide">Term 2 Results — Grade 9A</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">Auto-calculated · 2024/2025</p>
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
                        <td className="text-center px-3 py-2.5 font-medium text-gray-700">{r.t}</td>
                        <td className="text-center px-3 py-2.5"><span className={`px-2 py-0.5 rounded text-[10px] font-black ${r.gc}`}>{r.g}</span></td>
                        <td className="text-center px-3 py-2.5 font-black text-gray-900">#{r.r}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1.5">
                <XCircle className="h-3.5 w-3.5 text-rose-400"/> Before Novalss: 3 days of manual Excel work to produce this table
              </p>
            </div>
          </div>

          {/* All modules */}
          <div className="mt-20 text-center">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-5">17 more modules — all included, no extra charge</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["Attendance","Timetable","Library","Transport","Hostel","Inventory","Payroll","Online Exams","Homework","Lesson Plans","Front Office","Notice Board","Chat","Alumni","Leave","Reports","ID Cards"].map(m=>(
                <span key={m} className="bg-gray-50 border border-gray-200 text-gray-600 text-xs font-medium px-3.5 py-1.5 rounded-full">{m}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── SOCIAL PROOF — classroom girl ───────────── */}
      <section className="overflow-hidden border-y border-gray-100">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Left — dark with stats */}
          <div className="bg-slate-950 px-10 lg:px-16 py-20 flex flex-col justify-center order-2 lg:order-1">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-6">Real results from real schools</p>
            <blockquote className="text-3xl font-black text-white leading-snug tracking-tight">
              "We saved 3 days of admin work every single term."
            </blockquote>
            <p className="mt-4 text-slate-400 text-sm leading-relaxed">
              Principals across West Africa switched from spreadsheets to Novalss. Here's what changed.
            </p>
            <div className="mt-10 grid grid-cols-2 gap-8">
              {[{v:"80%",l:"Less time on fee collection"},{v:"3 days",l:"Saved per term on results"},{v:"60%",l:"Fewer parent office calls"},{v:"100%",l:"Stay after the free trial"}].map(s=>(
                <div key={s.l}>
                  <p className="text-4xl font-black text-indigo-400">{s.v}</p>
                  <p className="text-sm text-slate-500 mt-1 leading-snug">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-bold hover:bg-indigo-500 transition-colors">
                Start free today <ArrowRight className="h-4 w-4"/>
              </Link>
            </div>
          </div>
          {/* Right — classroom girl photo */}
          <div className="relative order-1 lg:order-2" style={{minHeight:480}}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/classroom-girl.jpg" alt="Student in classroom" className="absolute inset-0 w-full h-full object-cover object-center"/>
            <div className="absolute inset-0" style={{background:"linear-gradient(to right, rgba(2,6,23,0.3) 0%, transparent 50%)"}}/>
            {/* Overlay card */}
            <div className="absolute bottom-6 left-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-black text-sm shrink-0">AM</div>
                <div>
                  <p className="text-white font-bold text-sm">Mrs. Adjoa Mensah</p>
                  <p className="text-white/60 text-xs">Principal · GoldCoast Academy, Accra</p>
                </div>
                <div className="ml-auto flex gap-0.5 shrink-0">
                  {[1,2,3,4,5].map(i=><Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── HOW IT WORKS ───────────── */}
      <section id="how-it-works" className="bg-slate-950 py-28">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-3">Setup</p>
            <h2 className="text-4xl font-black text-white tracking-tight">Live in under 30 minutes.</h2>
            <p className="mt-3 text-slate-500">No IT team. No installation. No waiting.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 lg:gap-16">
            {[
              {n:"01",col:"text-indigo-400",t:"Register",d:"Create your account. Your school gets its own subdomain — yourschool.novalss.com — instantly."},
              {n:"02",col:"text-violet-400",t:"Set up classes & fees",d:"Add your sessions, classes, subjects, staff and fee types. The setup wizard guides you through each step."},
              {n:"03",col:"text-purple-400",t:"Enrol students",d:"Add students individually or import from a spreadsheet. Parents receive login access automatically."},
            ].map(s=>(
              <div key={s.n}>
                <p className={`text-8xl font-black leading-none ${s.col} opacity-15 mb-3`}>{s.n}</p>
                <h3 className="text-lg font-black text-white">{s.t}</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── TESTIMONIALS ───────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
            <div className="lg:col-span-2">
              {/* school-boy floats naturally on white */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/school-boy.jpg" alt="School boy ready to learn" className="w-full rounded-3xl object-contain" style={{maxHeight:380}}/>
              <div className="mt-6">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Principals.<br/>Admins.<br/>Teachers.<br/>They all love it.</h2>
                <p className="mt-3 text-sm text-gray-500 leading-relaxed">Real feedback from people running their schools on Novalss every day.</p>
              </div>
            </div>
            <div className="lg:col-span-3 space-y-4 lg:pt-4">
              {[
                {n:"Mrs. Adjoa Mensah",r:"Principal, GoldCoast Academy, Accra",i:"AM",c:"bg-blue-600",
                 q:"We used to spend the first two weeks of every term chasing fee payments. Now our accountant closes the books in a single afternoon. I cannot believe how much time we were wasting before."},
                {n:"Mr. Kojo Amponsah",r:"IT Admin, Adinkra College Group",i:"KA",c:"bg-violet-600",
                 q:"I manage three schools in our group. Each campus has completely isolated data but I can view everything from one login. The multi-tenant setup is exactly what we needed and it just works."},
                {n:"Mrs. Efua Asante",r:"Headmistress, Sunrise Primary, Kumasi",i:"EA",c:"bg-emerald-600",
                 q:"Parents used to call the office 20 times a day about results and fees. Since we gave them the parent portal, those calls have almost stopped. Our staff are calmer. It has been a genuine change."},
              ].map(t=>(
                <div key={t.n} className="bg-gray-50 border border-gray-100 rounded-2xl p-6">
                  <div className="flex gap-0.5 mb-4">{[1,2,3,4,5].map(i=><Star key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400"/>)}</div>
                  <p className="text-sm text-gray-700 leading-relaxed">"{t.q}"</p>
                  <div className="flex items-center gap-3 mt-5">
                    <div className={`w-9 h-9 rounded-full ${t.c} flex items-center justify-center text-xs font-black text-white shrink-0`}>{t.i}</div>
                    <div><p className="text-sm font-bold text-gray-900">{t.n}</p><p className="text-xs text-gray-400">{t.r}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ───────────── PRICING ───────────── */}
      <section id="pricing" className="bg-gray-50 border-y border-gray-200 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Transparent. Simple. No surprises.</h2>
            <p className="mt-3 text-gray-500 text-lg">Every plan includes every module. No add-ons.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            {[
              {name:"Starter",price:"Free",period:"14-day trial",desc:"Try the full platform — no commitment",hl:false,
               features:["Up to 100 students","5 staff accounts","All 20+ modules","Email support"],cta:"Start free trial"},
              {name:"Growth",price:"$29",period:"/ month",desc:"For schools up to 500 students",hl:true,badge:"Most popular",
               features:["Up to 500 students","Unlimited staff","All modules + reports","Priority support","CSV & PDF exports","Custom branding"],cta:"Get started"},
              {name:"Enterprise",price:"Custom",period:"",desc:"For large schools & groups",hl:false,
               features:["Unlimited students","Multi-school management","Dedicated support","Custom SLA","API access"],cta:"Contact us"},
            ].map(plan=>(
              <div key={plan.name} className={`relative rounded-2xl p-7 flex flex-col border ${plan.hl?"bg-slate-950 border-indigo-500 shadow-2xl shadow-indigo-900/20 -mt-3":"bg-white border-gray-200"}`}>
                {"badge" in plan&&plan.badge&&(
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-black px-4 py-0.5 rounded-full whitespace-nowrap">{plan.badge}</div>
                )}
                <p className={`text-xs font-black uppercase tracking-widest ${plan.hl?"text-indigo-400":"text-gray-400"}`}>{plan.name}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-black">{plan.price}</span>
                  <span className={`text-sm ${plan.hl?"text-slate-400":"text-gray-400"}`}>{plan.period}</span>
                </div>
                <p className={`mt-1 text-sm ${plan.hl?"text-slate-400":"text-gray-500"}`}>{plan.desc}</p>
                <ul className="mt-7 space-y-3 flex-1">
                  {plan.features.map(f=>(
                    <li key={f} className="flex items-start gap-2.5 text-sm">
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${plan.hl?"text-indigo-400":"text-emerald-500"}`}/>
                      <span className={plan.hl?"text-slate-300":"text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/register" className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-bold text-sm transition-colors ${plan.hl?"bg-indigo-600 text-white hover:bg-indigo-500":"bg-gray-900 text-white hover:bg-gray-700"}`}>
                  {plan.cta} <ArrowRight className="h-3.5 w-3.5"/>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FAQ ───────────── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Common questions</h2>
          </div>
          <div className="space-y-2">
            {[
              {q:"How long does setup actually take?",a:"Most schools are fully live — with classes, sections, fee types and staff accounts set up — within 30 minutes. Your subdomain is created the moment you register."},
              {q:"Is our school's data private from other schools?",a:"Yes. Every school runs in its own completely isolated database schema. There is no shared data between schools on the platform whatsoever."},
              {q:"Can parents and students log in?",a:"Yes. Students can view results, timetable, attendance and fee status. Parents see their child's full academic picture. No extra setup required."},
              {q:"What roles can access the system?",a:"Seven roles: Super Admin, Admin, Teacher, Accountant, Librarian, Student and Parent. Each has route-level permissions so staff only see what they need."},
              {q:"Can we print receipts, ID cards and marksheets?",a:"Yes. Everything is print-ready — fee receipts, student ID cards, admit cards and ranked marksheets all carry your school name, logo and branding."},
              {q:"What happens after the 14-day trial?",a:"Your data is safe. Upgrade to continue or export everything. We will never delete your data without warning."},
            ].map(({q,a})=>(
              <details key={q} className="group border border-gray-200 rounded-2xl overflow-hidden bg-white">
                <summary className="flex items-center justify-between px-6 py-5 cursor-pointer list-none font-bold text-gray-900 text-sm hover:bg-gray-50 transition-colors">
                  {q}<ChevronRight className="h-4 w-4 text-gray-400 shrink-0 ml-4 group-open:rotate-90 transition-transform duration-200"/>
                </summary>
                <div className="px-6 pb-5 pt-3 text-sm text-gray-500 leading-relaxed border-t border-gray-100">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FINAL CTA ───────────── */}
      <section className="bg-slate-950 py-32 border-t border-slate-800">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-xs font-bold text-indigo-400 uppercase tracking-widest mb-5">Make the switch today</p>
          <h2 className="text-5xl sm:text-6xl font-black text-white tracking-tight leading-[1.02]">
            Your school.<br/>
            <span className="text-indigo-400">Your platform.</span><br/>
            Live in 2 minutes.
          </h2>
          <p className="mt-6 text-slate-400 text-lg max-w-xl mx-auto">
            Join 50+ schools that stopped managing education in spreadsheets and WhatsApp groups.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-9 py-4 rounded-xl font-black text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/30">
              Create your school now <ArrowRight className="h-5 w-5"/>
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 border border-slate-700 text-slate-400 px-9 py-4 rounded-xl font-semibold hover:bg-slate-800 hover:text-white transition-colors">
              Already have an account
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-6 mt-8">
            {["No credit card","14-day free trial","All modules included","Cancel anytime"].map(t=>(
              <span key={t} className="flex items-center gap-1.5 text-sm text-slate-600">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0"/>{t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────── FOOTER ───────────── */}
      <footer className="bg-gray-950 border-t border-gray-800 pt-14 pb-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-10 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center"><GraduationCap className="h-4 w-4 text-white"/></div>
                <span className="font-black text-white">Novalss</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">Complete school management for educational institutions across Africa.</p>
            </div>
            {[
              {title:"Product",links:[["Features","#features"],["How it works","#how-it-works"],["Pricing","#pricing"],["FAQ","#faq"]]},
              {title:"Modules",links:[["Students","#features"],["Fee Management","#features"],["Exams","#features"],["Staff & Payroll","#features"]]},
              {title:"Account",links:[["Get started","/register"],["Sign in","/sign-in"]]},
            ].map(col=>(
              <div key={col.title}>
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-4">{col.title}</p>
                <ul className="space-y-2.5">
                  {col.links.map(([l,h])=>(
                    <li key={l}><Link href={h} className="text-sm text-gray-600 hover:text-gray-300 transition-colors">{l}</Link></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-700">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <div className="flex gap-6">
              {["Privacy Policy","Terms of Service"].map(l=>(
                <a key={l} href="#" className="text-xs text-gray-700 hover:text-gray-400 transition-colors">{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
