import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
} from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to learn more about Skula for my school.")}`;

// Real WhatsApp SVG — not the generic Lucide MessageCircle
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
    <div className="min-h-screen bg-[#0a0a0f] antialiased text-white">

      {/* ── NAV ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-9">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <GraduationCap className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="font-black text-white text-base tracking-tight">Skula</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[["Features","/features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=>(
                <a key={l} href={h} className="text-sm font-medium text-slate-400 hover:text-white transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-slate-400 hover:text-white px-3 py-2 transition-colors">
              Sign in
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 border border-white/10 text-slate-200 text-sm font-semibold px-3.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              WhatsApp
            </a>
            <Link href="/demo" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20">
              Try demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.03) 1px,transparent 0)", backgroundSize:"28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">

          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-slate-300 text-xs font-semibold px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Built for schools in Ghana — JHS, SHS &amp; Basic
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[70px] font-black leading-[1.02] tracking-tight max-w-4xl mx-auto">
            Run your school.<br />
            Not your paperwork.<br />
            <span className="text-indigo-400">Skula handles it.</span>
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Stop collecting fees in a notebook. Stop sending marks in a WhatsApp group.
            Skula gives every Ghanaian school a proper system — students, fees, attendance,
            exams and staff, all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/25"
            >
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-8 py-4 rounded-xl font-bold text-base transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <WhatsAppIcon className="h-5 w-5" />
              Chat with us on WhatsApp
            </a>
          </div>

          <p className="mt-5 text-slate-600 text-sm">
            No credit card · Free 30-day trial · All modules included
          </p>
        </div>
      </section>

      {/* ── SOCIAL PROOF TICKER ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: "50+",    l: "Schools using Skula" },
            { n: "16",     l: "Modules included" },
            { n: "< 30 min", l: "To go fully live" },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="text-3xl sm:text-4xl font-black text-white">{n}</p>
              <p className="text-slate-500 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-slate-500 text-sm font-semibold uppercase tracking-widest mb-3">Sound familiar?</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">
            Every school in Ghana deals with this.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              before: "Fee receipts written by hand in a duplicate book",
              after:  "Digital receipt printed in seconds, WhatsApp copy to parent",
            },
            {
              before: "Marks shared in a teachers' WhatsApp group",
              after:  "Every teacher enters marks online, report cards auto-generate",
            },
            {
              before: "Attendance in a paper register that gets lost every term",
              after:  "Class-by-class attendance on any phone, reports ready instantly",
            },
          ].map(({ before, after }) => (
            <div key={before} className="rounded-2xl border border-white/5 overflow-hidden">
              <div className="px-5 py-4 bg-red-500/5 border-b border-white/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-red-400 mb-2">Before</p>
                <p className="text-slate-400 text-sm leading-relaxed">{before}</p>
              </div>
              <div className="px-5 py-4 bg-emerald-500/5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-2">With Skula</p>
                <p className="text-slate-300 text-sm leading-relaxed">{after}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section className="max-w-6xl mx-auto px-4 pb-20">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111118] shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-[#0d0d14]">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="mx-auto bg-white/5 rounded-md px-12 py-1.5 text-slate-600 text-xs">getskula.com/dashboard</div>
          </div>
          <div className="flex">
            <div className="hidden md:flex flex-col w-44 shrink-0 border-r border-white/5 p-3 gap-0.5">
              {["Dashboard","Students","Fees","Attendance","Exams","Reports"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${i === 0 ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-slate-600"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-400" : "bg-white/10"}`} />
                  {item}
                </div>
              ))}
            </div>
            <div className="flex-1 p-5">
              <p className="text-white text-sm font-bold mb-4">GoldCoast Academy <span className="text-slate-600 font-normal">· 2025/2026</span></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label:"STUDENTS", val:"342", color:"bg-indigo-500" },
                  { label:"STAFF",    val:"28",  color:"bg-violet-500" },
                  { label:"FEES (GHS)", val:"84,500", color:"bg-emerald-500" },
                  { label:"ATTENDANCE", val:"94%", color:"bg-amber-500" },
                ].map(({ label, val, color }) => (
                  <div key={label} className="bg-slate-900 rounded-xl p-4">
                    <div className={`w-2 h-2 rounded-full ${color} mb-2`} />
                    <p className="text-white text-xl font-black">{val}</p>
                    <p className="text-slate-500 text-[10px] mt-0.5 uppercase tracking-wide">{label}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-3">Recent payments</p>
                  {[["Kwame Asante","GHS 450"],["Abena Mensah","GHS 380"],["Kofi Tawiah","GHS 600"]].map(([n,a])=>(
                    <div key={n} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-300 text-xs">{n}</span>
                      <span className="text-emerald-400 text-xs font-bold">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-3">Attendance this week</p>
                  <div className="flex items-end gap-1 h-16">
                    {[82,88,91,79,95,87,93].map((h,i)=>(
                      <div key={i} className="flex-1 bg-indigo-600/20 rounded-sm relative">
                        <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-sm" style={{ height: `${h}%` }} />
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between mt-2">
                    {["M","T","W","T","F","S","S"].map((d,i)=>(
                      <span key={i} className="flex-1 text-center text-slate-600 text-[9px]">{d}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything built in</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">16 modules. Zero extra cost.</h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">
            No plugins. No upgrades. Everything you need to run a Ghanaian school is already there.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users,         title: "Student Management",  desc: "Enroll, promote, ID cards, profiles and document uploads. BECE candidates tracked separately." },
            { icon: DollarSign,    title: "Fee Collection",       desc: "Issue GHS receipts instantly, track defaulters, send WhatsApp reminders to parents." },
            { icon: ClipboardList, title: "Attendance",           desc: "Mark attendance per class on any device. Absent reports sent to parents same day." },
            { icon: BookOpen,      title: "Exams & Report Cards", desc: "Enter marks, auto-rank students, generate BECE-style report cards ready to print." },
            { icon: BarChart2,     title: "Reports",              desc: "Fee reports, student lists, staff attendance — download to PDF or CSV in one click." },
            { icon: MessageSquare, title: "Communication",        desc: "Bulk SMS to parents, homework assignments, notice board and internal staff messaging." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="group p-6 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/20 transition-all duration-200">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 flex items-center justify-center mb-4 group-hover:bg-indigo-600/20 transition-colors">
                <Icon className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-white font-bold text-base mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/features" className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-semibold text-sm transition-colors">
            See all 16 modules <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-12">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">From the people using it</p>
            <h2 className="text-3xl font-black text-white">What school leaders are saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "Before Skula, I was spending every Friday afternoon printing fee receipts by hand. Now my accountant does it all from the system and I don't hear about it until the monthly report.",
                name:  "Mrs. Adjoa Asante",
                role:  "Headmistress",
                school:"GoldCoast Academy, Accra",
                init:  "AA",
              },
              {
                quote: "The exam module saved us an entire week. We used to type report cards in Word, print, retype when there were errors. Now we enter marks once and Skula does everything else.",
                name:  "Mr. Kofi Acheampong",
                role:  "Director",
                school:"Tema Community JHS",
                init:  "KA",
              },
              {
                quote: "Parents actually pay faster because they get a WhatsApp receipt the moment the accountant records it. Our term 2 collections improved by nearly 30% after we started using Skula.",
                name:  "Mrs. Ama Boateng",
                role:  "Principal",
                school:"Sunflower Int'l School, Kumasi",
                init:  "AB",
              },
            ].map(({ quote, name, role, school, init }) => (
              <div key={name} className="p-6 rounded-2xl border border-white/5 bg-white/[0.02] flex flex-col">
                <div className="flex gap-1 mb-4">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} className="h-3.5 w-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed flex-1 italic">"{quote}"</p>
                <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
                  <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-black shrink-0">{init}</div>
                  <div>
                    <p className="text-white text-sm font-bold">{name}</p>
                    <p className="text-slate-500 text-xs">{role} · {school}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple to start</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Live in under 30 minutes</h2>
          <p className="text-slate-400 mt-3 max-w-lg mx-auto text-sm">
            We don't just hand you a system and disappear. We set it up with you.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              n:"01",
              title:"Send us a message",
              desc:"WhatsApp or fill the contact form. We'll create your school account and be ready before the call ends.",
            },
            {
              n:"02",
              title:"We onboard together",
              desc:"Add your classes, sections, subjects and fee types. Our 4-step wizard walks you through everything in 20 minutes.",
            },
            {
              n:"03",
              title:"Your school goes live",
              desc:"Share logins with your teachers and accountant. Start taking attendance, collecting fees and printing report cards today.",
            },
          ].map(({ n, title, desc }) => (
            <div key={n} className="relative">
              <p className="text-6xl font-black text-white/[0.04] leading-none select-none mb-2">{n}</p>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">{n}</p>
              <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 text-center">
          <a
            href={WHATSAPP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fba5a] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-lg shadow-[#25D366]/25"
          >
            <WhatsAppIcon className="h-4 w-4" />
            Start the conversation on WhatsApp
          </a>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="border-t border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Clear pricing. No surprises.</h2>
            <p className="text-slate-400 mt-4">Every plan includes all 16 modules. No per-module fees. Prices in GHS.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: "Free Trial",
                price: "Free",
                sub: "for 30 days",
                hl: false,
                cta: "Try it free",
                href: "/demo",
                features: ["All 16 modules","Up to 200 students","Email support","Skula subdomain"],
              },
              {
                name: "School",
                price: "GHS 299",
                sub: "per month",
                hl: true,
                cta: "Get started",
                href: "/contact",
                features: ["Everything in Free","Unlimited students","Priority WhatsApp support","Custom domain","Parent SMS notifications","Data export & backup"],
              },
              {
                name: "Enterprise",
                price: "Talk to us",
                sub: "custom pricing",
                hl: false,
                cta: "Contact us",
                href: "/contact",
                features: ["Everything in School","Dedicated database","SLA & uptime guarantee","Staff training visit","Custom integrations","On-site setup"],
              },
            ].map(({ name, price, sub, hl, features, cta, href }) => (
              <div key={name} className={`rounded-2xl p-7 border relative ${hl ? "border-indigo-500 bg-indigo-600/5" : "border-white/5 bg-white/[0.02]"}`}>
                {hl && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Most popular</div>}
                <p className="text-slate-400 text-sm font-semibold mb-3">{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black text-white">{price}</span>
                </div>
                <p className="text-slate-600 text-xs mb-7">{sub}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-slate-300">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    hl ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-white/10 text-slate-300 hover:bg-white/5"
                  }`}
                >
                  {cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {[
            {
              q: "How long does it actually take to set up?",
              a: "Most schools are fully live — classes, sections, fee types and staff accounts all configured — in under 30 minutes. We stay on the call with you until everything is ready.",
            },
            {
              q: "Do I need any technical knowledge?",
              a: "None at all. If you can use WhatsApp, you can use Skula. We also offer free onboarding support for every school.",
            },
            {
              q: "Can my accountant, teachers and admin use it at the same time?",
              a: "Yes. Each staff member gets their own login with access only to what they need. The accountant sees fees, the teacher sees their classes, the admin sees everything.",
            },
            {
              q: "Is the data for my school kept separate from other schools?",
              a: "Completely. Each school runs in an isolated database. No other school can ever see your students, fees, or any records.",
            },
            {
              q: "What happens when the free trial ends?",
              a: "We'll reach out before anything changes. Your data is never deleted. You can upgrade, or we'll work something out — we won't leave you stuck.",
            },
            {
              q: "Does it work for Basic, JHS and SHS schools?",
              a: "Yes. Skula supports all levels of the Ghanaian school system. We have BECE candidate tracking, JHS grading scales, and term-based academic calendars built in.",
            },
          ].map(({ q, a }, i) => (
            <details key={i} className="group border border-white/5 rounded-xl overflow-hidden">
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-white font-semibold text-sm list-none hover:bg-white/[0.02] transition-colors">
                {q}
                <ChevronDown className="h-4 w-4 text-slate-500 shrink-0 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-slate-400 text-sm leading-relaxed border-t border-white/5 pt-4">{a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="border-t border-white/5">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-indigo-400 text-sm font-bold uppercase tracking-widest mb-4">Ready when you are</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Your school deserves<br />a proper system.
          </h2>
          <p className="text-slate-400 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Try the live demo now — no sign-up. Or send us a WhatsApp message and we'll
            set everything up with you today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-9 py-4 rounded-xl font-black text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/25"
            >
              Try the demo free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-9 py-4 rounded-xl font-black text-base transition-colors shadow-lg shadow-[#25D366]/20"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp us now
            </a>
          </div>
          <p className="text-slate-600 text-sm mt-6">Free 30-day trial · GHS 299/mo after · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-white text-sm tracking-tight">Skula</span>
              </div>
              <p className="text-slate-600 text-xs max-w-xs leading-relaxed">
                School management built for Ghanaian schools.<br />
                By <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">Novalss</a>.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  {[["Features","/features"],["Pricing","#pricing"],["Demo","/demo"],["Contact","/contact"]].map(([l,h])=>(
                    <a key={l} href={h} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Company</p>
                <div className="flex flex-col gap-2">
                  {[["Sign in","/sign-in"],["Novalss","https://novalss.com"],["WhatsApp",WHATSAPP_URL]].map(([l,h])=>(
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-700 text-xs">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors"
            >
              <WhatsAppIcon className="h-3 w-3" /> Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
