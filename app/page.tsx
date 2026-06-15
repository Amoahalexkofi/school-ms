import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
  Shield, Clock, TrendingUp, Smartphone,
} from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to learn more about Skula for my school.")}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white antialiased text-slate-900">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/98 backdrop-blur-sm border-b border-slate-100 shadow-sm shadow-slate-100/50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2.5 shrink-0">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="font-black text-slate-900 text-[15px] tracking-tight">Skula</span>
            </Link>
            <div className="hidden md:flex items-center gap-7">
              {[["Features","/features"],["Pricing","#pricing"],["FAQs","#faq"],["Contact","/contact"]].map(([l,h])=>(
                <a key={l} href={h} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link href="/sign-in"
              className="hidden sm:inline-flex items-center text-[13px] font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300 px-4 py-2 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/contact"
              className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-4 py-2 rounded-lg transition-colors shadow-sm shadow-indigo-200">
              Start free trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative bg-white pt-16 overflow-hidden">
        {/* Subtle background shape */}
        <div className="absolute inset-y-0 right-0 w-[55%] bg-indigo-50/40 rounded-l-[80px] pointer-events-none hidden lg:block" />
        <div className="absolute top-20 right-[15%] w-80 h-80 bg-indigo-100/60 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center min-h-[calc(100vh-64px)] max-h-[780px]">

            {/* Left */}
            <div className="py-16 lg:py-0">
              <div className="inline-flex items-center gap-2 text-indigo-700 text-[12px] font-bold px-3.5 py-1.5 rounded-full mb-5 border border-indigo-200 bg-indigo-50">
                <span className="text-base leading-none">🇬🇭</span>
                Built for Ghanaian schools — JHS, SHS &amp; Basic
              </div>

              <h1 className="text-[42px] sm:text-5xl lg:text-[52px] font-black leading-[1.06] tracking-tight text-slate-900">
                Transform how your<br />
                school works.<br />
                <span className="text-indigo-600">Skula makes it simple.</span>
              </h1>

              <p className="mt-5 text-slate-500 text-[16px] leading-relaxed max-w-[420px]">
                Students, fees, attendance, exams and staff — all running from one dashboard.
                Live in under 30 minutes.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3.5 rounded-xl font-bold text-[14px] transition-colors shadow-lg shadow-indigo-200">
                  Register your school <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 px-6 py-3.5 rounded-xl font-bold text-[14px] transition-colors">
                  Try live demo
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-6">
                {["No credit card required","Free 30-day trial","Live in 30 minutes"].map(t => (
                  <span key={t} className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — photo + floating cards */}
            <div className="relative hidden lg:flex items-center justify-center py-10">

              {/* Floating card — top left */}
              <div className="absolute top-12 left-0 z-20 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-4 flex items-center gap-3 w-52">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-black leading-tight">GHS 84,500</p>
                  <p className="text-slate-400 text-[11px] mt-0.5">Fees collected · Term 2</p>
                </div>
              </div>

              {/* Floating card — middle right */}
              <div className="absolute top-1/2 -translate-y-1/2 right-[-20px] z-20 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-4 w-48">
                <div className="flex items-center gap-2 mb-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <p className="text-slate-500 text-[11px] font-semibold">Total Students</p>
                </div>
                <p className="text-slate-900 text-2xl font-black">342</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  <span className="text-emerald-600 text-[10px] font-bold">+12 this term</span>
                </div>
              </div>

              {/* Floating card — bottom left */}
              <div className="absolute bottom-16 left-4 z-20 bg-white rounded-2xl shadow-2xl shadow-slate-200/60 border border-slate-100 p-3.5 w-44">
                <p className="text-slate-400 text-[10px] font-semibold uppercase tracking-wide mb-2">Attendance</p>
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "94%" }} />
                  </div>
                  <span className="text-slate-900 text-xs font-black">94%</span>
                </div>
                <p className="text-slate-400 text-[10px]">Today · All classes</p>
              </div>

              {/* Photo */}
              <div className="relative w-[420px] h-[520px]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
                  alt="School administrator using Skula"
                  className="w-full h-full object-cover object-top rounded-3xl"
                />
                {/* Bottom fade to match bg */}
                <div className="absolute inset-x-0 bottom-0 h-32 rounded-b-3xl"
                  style={{ background: "linear-gradient(to top, #f5f3ff 0%, transparent 100%)" }} />
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ── TRUSTED BY ── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-8">
            Trusted by schools across Ghana
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            {[
              { n: "50+",     l: "Schools active" },
              { n: "16",      l: "Built-in modules" },
              { n: "< 30min", l: "Average setup time" },
              { n: "98%",     l: "Fee collection accuracy" },
            ].map(({ n, l }) => (
              <div key={l} className="text-center">
                <p className="text-3xl font-black text-indigo-600">{n}</p>
                <p className="text-slate-500 text-xs mt-1">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SKULA ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">Why Skula</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Everything your school needs</h2>
            <p className="text-slate-500 mt-4 max-w-lg mx-auto text-sm">
              16 modules included. No per-feature pricing. No plugins. Just one complete system.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {[
              { icon: Users,     color: "bg-indigo-500", light: "bg-indigo-50", title: "Student Management",  desc: "Enrollment, ID cards, BECE tracking, promotions and full student profiles." },
              { icon: DollarSign,color: "bg-emerald-500",light: "bg-emerald-50",title: "Fee Collection",       desc: "GHS receipts, defaulter tracking and WhatsApp payment alerts to parents." },
              { icon: ClipboardList, color:"bg-amber-500",light:"bg-amber-50",  title: "Attendance",           desc: "Daily class attendance from any phone. Absent alerts sent to parents same day." },
              { icon: BookOpen,  color: "bg-violet-500", light: "bg-violet-50", title: "Exams & Reports",      desc: "Enter marks, auto-rank, generate BECE-style report cards ready to print." },
            ].map(({ icon: Icon, color, light, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                <div className={`w-11 h-11 ${light} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${color.replace("bg-","text-")}`} />
                </div>
                <h3 className="text-slate-900 font-bold text-[14px] mb-1.5">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: BarChart2,    color: "bg-rose-500",   light: "bg-rose-50",   title: "Reports",        desc: "Fee summaries, student lists, staff attendance — download PDF or CSV instantly." },
              { icon: MessageSquare,color: "bg-sky-500",    light: "bg-sky-50",    title: "Communication",  desc: "Bulk SMS to parents, homework, notice board and internal messaging." },
              { icon: Shield,       color: "bg-teal-500",   light: "bg-teal-50",   title: "Role Access",    desc: "7 roles — admin, teacher, accountant, librarian, student, parent, super admin." },
              { icon: Smartphone,   color: "bg-orange-500", light: "bg-orange-50", title: "Works on Mobile",desc: "Full access on any phone or tablet. No app download needed — just a browser." },
            ].map(({ icon: Icon, color, light, title, desc }) => (
              <div key={title} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all">
                <div className={`w-11 h-11 ${light} rounded-xl flex items-center justify-center mb-4`}>
                  <Icon className={`h-5 w-5 ${color.replace("bg-","text-")}`} />
                </div>
                <h3 className="text-slate-900 font-bold text-[14px] mb-1.5">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/features" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold text-sm">
              View all 16 modules <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── BEFORE / AFTER ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">Sound familiar?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Every school in Ghana deals with this.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { before: "Fee receipts written by hand in a duplicate book", after: "Digital receipt printed in seconds, WhatsApp copy sent to parent" },
              { before: "Marks shared in a teachers' WhatsApp group", after: "Every teacher enters marks online, report cards auto-generate" },
              { before: "Attendance in a paper register that gets lost every term", after: "Class-by-class attendance on any phone, reports ready instantly" },
            ].map(({ before, after }) => (
              <div key={before} className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-red-50 border-b border-red-100">
                  <p className="text-[10px] font-black uppercase tracking-wider text-red-400 mb-2">Before Skula</p>
                  <p className="text-slate-600 text-[13px] leading-relaxed">{before}</p>
                </div>
                <div className="px-5 py-4 bg-white">
                  <p className="text-[10px] font-black uppercase tracking-wider text-emerald-500 mb-2">With Skula ✓</p>
                  <p className="text-slate-700 text-[13px] leading-relaxed">{after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD PREVIEW ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">The product</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Everything in one dashboard</h2>
          </div>
          <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/60 bg-white">
            <div className="flex items-center gap-2 px-5 py-3 bg-slate-100 border-b border-slate-200">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto bg-white border border-slate-200 rounded px-10 py-1 text-slate-400 text-xs">getskula.com/dashboard</div>
            </div>
            <div className="flex bg-white">
              <div className="hidden md:flex flex-col w-44 shrink-0 border-r border-slate-100 p-3 gap-0.5">
                {["Dashboard","Students","Fees","Attendance","Exams","Reports"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs ${
                    i === 0 ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:bg-slate-50"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-white/60" : "bg-slate-300"}`} />
                    {item}
                  </div>
                ))}
              </div>
              <div className="flex-1 p-5 bg-slate-50/50">
                <p className="text-slate-900 text-sm font-bold mb-4">GoldCoast Academy <span className="text-slate-400 font-normal">· 2025/2026</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label:"Students",   val:"342",    icon: Users,       bg:"bg-indigo-600" },
                    { label:"Staff",      val:"28",     icon: Users,       bg:"bg-violet-500" },
                    { label:"Fees (GHS)", val:"84,500", icon: DollarSign,  bg:"bg-emerald-500" },
                    { label:"Attendance", val:"94%",    icon: ClipboardList,bg:"bg-amber-500" },
                  ].map(({ label, val, bg, icon: Icon }) => (
                    <div key={label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2.5`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-slate-900 text-xl font-black">{val}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 font-medium">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-3">Recent payments</p>
                    {[["Kwame Asante","GHS 450"],["Abena Mensah","GHS 380"],["Kofi Tawiah","GHS 600"]].map(([n,a])=>(
                      <div key={n} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-slate-600 text-xs">{n}</span>
                        <span className="text-emerald-600 text-xs font-bold">{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-100">
                    <p className="text-slate-500 text-xs font-semibold mb-3">Attendance this week</p>
                    <div className="flex items-end gap-1 h-16">
                      {[82,88,91,79,95,87,93].map((h,i)=>(
                        <div key={i} className="flex-1 rounded-sm overflow-hidden bg-indigo-100" style={{ height: "100%" }}>
                          <div className="bg-indigo-500 rounded-sm" style={{ height: `${h}%`, marginTop: `${100-h}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex mt-2">
                      {["M","T","W","T","F","S","S"].map((d,i)=>(
                        <span key={i} className="flex-1 text-center text-slate-400 text-[9px]">{d}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">Simple to start</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Live in under 30 minutes</h2>
            <p className="text-slate-500 mt-3 max-w-md mx-auto text-sm">We set it up with you. You're not on your own.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Connector line */}
            <div className="hidden md:block absolute top-10 left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-slate-200" />
            {[
              { n:"1", title:"Send us a message", desc:"WhatsApp or fill the contact form. We'll create your school account and be ready before the call ends.", icon: MessageSquare },
              { n:"2", title:"We onboard together", desc:"Add classes, sections, subjects and fee types. Our wizard walks you through in 20 minutes.", icon: Users },
              { n:"3", title:"Your school goes live", desc:"Give logins to teachers and accountant. Start attendance, fees and report cards the same day.", icon: CheckCircle2 },
            ].map(({ n, title, desc, icon: Icon }) => (
              <div key={n} className="bg-slate-50 rounded-2xl border border-slate-100 p-7 text-center relative">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg mb-5 mx-auto relative z-10 shadow-lg shadow-indigo-200">
                  {n}
                </div>
                <h3 className="text-slate-900 font-bold text-[15px] mb-2">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-green-100">
              <WhatsAppIcon className="h-4 w-4" />
              Start the conversation on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">School leaders testify</p>
            <h2 className="text-3xl font-black text-slate-900">What schools are saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Skula, I spent every Friday printing fee receipts by hand. Now my accountant handles it all and I only see the monthly report.", name: "Mrs. Adjoa Asante", role: "Headmistress", school: "GoldCoast Academy, Accra", init: "AA", color: "bg-indigo-600" },
              { quote: "The exam module saved us an entire week. We used to type report cards in Word. Now we enter marks once and Skula does everything else.", name: "Mr. Kofi Acheampong", role: "Director", school: "Tema Community JHS", init: "KA", color: "bg-violet-600" },
              { quote: "Parents pay faster because they get a WhatsApp receipt instantly. Our term 2 collections improved by nearly 30% after we started using Skula.", name: "Mrs. Ama Boateng", role: "Principal", school: "Sunflower Int'l, Kumasi", init: "AB", color: "bg-emerald-600" },
            ].map(({ quote, name, role, school, init, color }) => (
              <div key={name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-[13px] leading-relaxed flex-1">"{quote}"</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white text-xs font-black shrink-0`}>{init}</div>
                  <div>
                    <p className="text-slate-900 text-sm font-bold">{name}</p>
                    <p className="text-slate-400 text-xs">{role} · {school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Clear pricing. No surprises.</h2>
            <p className="text-slate-500 mt-4 text-sm">All 16 modules included in every plan. No per-module fees. Prices in GHS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              { name:"Free Trial",price:"Free",sub:"for 30 days",hl:false,cta:"Try it free",href:"/demo",features:["All 16 modules","Up to 200 students","Email support","Skula subdomain"] },
              { name:"School",price:"GHS 299",sub:"per month",hl:true,cta:"Get started",href:"/contact",features:["Everything in Free","Unlimited students","Priority WhatsApp support","Custom domain","Parent SMS notifications","Daily data backup"] },
              { name:"Enterprise",price:"Talk to us",sub:"custom pricing",hl:false,cta:"Contact us",href:"/contact",features:["Everything in School","Dedicated database","SLA & uptime guarantee","Staff training visit","Custom integrations","On-site setup"] },
            ].map(({ name, price, sub, hl, features, cta, href }) => (
              <div key={name} className={`rounded-2xl p-7 border relative ${hl ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-200/50" : "bg-white border-slate-200 shadow-sm"}`}>
                {hl && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-black px-4 py-1 rounded-full whitespace-nowrap tracking-wide">MOST POPULAR</div>}
                <p className={`text-sm font-semibold mb-2 ${hl ? "text-indigo-200" : "text-slate-400"}`}>{name}</p>
                <p className={`text-3xl font-black mb-0.5 ${hl ? "text-white" : "text-slate-900"}`}>{price}</p>
                <p className={`text-xs mb-7 ${hl ? "text-indigo-300" : "text-slate-400"}`}>{sub}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-[13px] ${hl ? "text-indigo-100" : "text-slate-600"}`}>
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${hl ? "text-indigo-300" : "text-indigo-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href} className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${hl ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-[11px] font-bold uppercase tracking-widest mb-3">FAQs</p>
            <h2 className="text-3xl font-black text-slate-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-2">
            {[
              { q:"How long does it actually take to set up?", a:"Most schools are fully live — classes, sections, fee types and staff accounts all configured — in under 30 minutes. We stay on the call with you until everything is ready." },
              { q:"Do I need any technical knowledge?", a:"None at all. If you can use WhatsApp, you can use Skula. We also offer free onboarding support for every school." },
              { q:"Can my accountant, teachers and admin use it at the same time?", a:"Yes. Each staff member gets their own login with access only to what they need. The accountant sees fees, the teacher sees their classes, the admin sees everything." },
              { q:"Is the data for my school kept separate from other schools?", a:"Completely. Each school runs in an isolated database. No other school can ever see your students, fees, or any records." },
              { q:"What happens when the free trial ends?", a:"We'll reach out before anything changes. Your data is never deleted. You can upgrade, or we'll work something out — we won't leave you stuck." },
              { q:"Does it work for Basic, JHS and SHS schools?", a:"Yes. Skula supports all levels of the Ghanaian school system. We have BECE candidate tracking, JHS grading scales, and term-based academic calendars built in." },
            ].map(({ q, a }, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-slate-800 font-semibold text-sm list-none hover:text-indigo-700 transition-colors">
                  {q}
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 pt-0 text-slate-500 text-sm leading-relaxed border-t border-slate-100">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="bg-white py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="bg-indigo-600 rounded-3xl px-8 py-16 text-center relative overflow-hidden shadow-2xl shadow-indigo-200">
            <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3" />
            <div className="absolute bottom-0 left-0 w-52 h-52 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="relative">
              <p className="text-indigo-300 text-[11px] font-bold uppercase tracking-widest mb-4">Ready when you are</p>
              <h2 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                Your school deserves<br />a proper system.
              </h2>
              <p className="text-indigo-200 text-[15px] mb-10 max-w-md mx-auto leading-relaxed">
                Try the live demo — no sign-up needed. Or WhatsApp us and we'll have your school live today.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-8 py-4 rounded-xl font-black text-[15px] hover:bg-indigo-50 transition-colors shadow-lg">
                  Try the demo free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-8 py-4 rounded-xl font-black text-[15px] transition-colors shadow-lg">
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp us now
                </a>
              </div>
              <p className="text-indigo-300/80 text-xs mt-6">Free 30-day trial · GHS 299/mo after · Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-10">
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-white text-sm">Skula</span>
              </div>
              <p className="text-slate-500 text-xs leading-relaxed">
                School management built for Ghanaian schools — JHS, SHS and Basic.
                By <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Novalss</a>.
              </p>
            </div>
            <div className="flex gap-12 sm:gap-16">
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Product</p>
                <div className="flex flex-col gap-2.5">
                  {[["Features","/features"],["Pricing","#pricing"],["Demo","/demo"],["Contact","/contact"]].map(([l,h])=>(
                    <a key={l} href={h} className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider mb-4">Company</p>
                <div className="flex flex-col gap-2.5">
                  {[["Sign in","/sign-in"],["Novalss","https://novalss.com"]].map(([l,h])=>(
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a>
                  ))}
                  <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[#25D366] hover:text-[#4ade80] text-sm transition-colors">
                    <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#25D366]/70 hover:text-[#25D366] text-xs font-medium transition-colors">
              <WhatsAppIcon className="h-3 w-3" /> Chat with us
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
