import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
  MessageCircle,
} from "lucide-react";

const WHATSAPP_NUMBER = "PLACEHOLDER";
const WHATSAPP_URL    = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to learn more about Skula.")}`;

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
                <GraduationCap className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
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
              className="hidden sm:inline-flex items-center gap-1.5 border border-white/10 text-slate-200 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <MessageCircle className="h-3.5 w-3.5 text-[#25D366]" />
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
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage:"radial-gradient(circle at 1px 1px,rgba(255,255,255,0.03) 1px,transparent 0)", backgroundSize:"28px 28px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 text-slate-400 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Trusted by 50+ schools across West Africa
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-[72px] font-black leading-[1.02] tracking-tight max-w-4xl mx-auto">
            Your school.<br />
            Fully managed.<br />
            <span className="text-indigo-400">One platform.</span>
          </h1>

          <p className="mt-6 text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
            Stop running your school on spreadsheets and WhatsApp groups. Skula gives you
            students, fees, exams, attendance and staff — all in one place, live in 30 minutes.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <Link href="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/25">
              Try it free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] px-8 py-4 rounded-xl font-bold text-base hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>

          <p className="mt-5 text-slate-600 text-sm">
            No credit card · No setup fee · All 16 modules included
          </p>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: "50+",    l: "Schools active" },
            { n: "16",     l: "Modules included" },
            { n: "30 min", l: "Average setup time" },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="text-3xl sm:text-4xl font-black text-white">{n}</p>
              <p className="text-slate-500 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-[#111118] shadow-2xl shadow-black/50">
          {/* Fake top bar */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/5 bg-[#0d0d14]">
            <span className="w-3 h-3 rounded-full bg-red-500/60" />
            <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <span className="w-3 h-3 rounded-full bg-green-500/60" />
            <div className="mx-auto bg-white/5 rounded-md px-12 py-1.5 text-slate-600 text-xs">getskula.com/dashboard</div>
          </div>
          {/* Mock dashboard */}
          <div className="flex">
            {/* Sidebar */}
            <div className="hidden md:flex flex-col w-44 shrink-0 border-r border-white/5 p-3 gap-0.5">
              {["Dashboard","Students","Fees","Attendance","Exams","Reports"].map((item, i) => (
                <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${i === 0 ? "bg-indigo-600/20 text-indigo-400 font-medium" : "text-slate-600"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-400" : "bg-white/10"}`} />
                  {item}
                </div>
              ))}
            </div>
            {/* Main area */}
            <div className="flex-1 p-5">
              <p className="text-white text-sm font-bold mb-4">Nova School <span className="text-slate-600 font-normal">· 2025/2026</span></p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                {[
                  { label:"STUDENTS", val:"342", color:"bg-indigo-500" },
                  { label:"STAFF", val:"28", color:"bg-violet-500" },
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
                  {[["Kwame A.","GHS 450"],["Abena M.","GHS 380"],["Kofi T.","GHS 600"]].map(([n,a])=>(
                    <div key={n} className="flex justify-between py-1.5 border-b border-white/5 last:border-0">
                      <span className="text-slate-300 text-xs">{n}</span>
                      <span className="text-emerald-400 text-xs font-bold">{a}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-900 rounded-xl p-4">
                  <p className="text-slate-400 text-xs mb-3">Attendance today</p>
                  <div className="flex items-end gap-1 h-16">
                    {[70,85,90,75,95,88,92].map((h,i)=>(
                      <div key={i} className="flex-1 bg-indigo-600/30 rounded-sm relative">
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
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Everything in one place</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">All the tools your school needs</h2>
          <p className="text-slate-400 mt-4 max-w-xl mx-auto">16 fully-built modules, no extra cost, no plugins. Everything works together out of the box.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Users,         title: "Student Management",   desc: "Enroll, promote, manage profiles, attendance and ID cards for every student."  },
            { icon: DollarSign,    title: "Fee Management",        desc: "Collect fees, issue receipts, track defaulters — with WhatsApp and email alerts." },
            { icon: ClipboardList, title: "Attendance",            desc: "Mark daily attendance per class, generate reports and catch patterns early."     },
            { icon: BookOpen,      title: "Exams & Results",       desc: "Schedule exams, enter marks, auto-generate report cards and admit cards."        },
            { icon: BarChart2,     title: "Reports & Analytics",   desc: "Student lists, fee reports, staff attendance — export to CSV in one click."      },
            { icon: MessageSquare, title: "Communication",         desc: "Notice board, homework, bulk SMS to parents, and internal staff chat."            },
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

      {/* ── HOW IT WORKS ── */}
      <section className="border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-6xl mx-auto px-6 py-20">
          <div className="text-center mb-14">
            <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Simple setup</p>
            <h2 className="text-3xl sm:text-4xl font-black text-white">Live in 30 minutes</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { n:"01", title:"Chat with us", desc:"Send us a WhatsApp message or fill the contact form. We'll set up your school's account while you watch." },
              { n:"02", title:"Onboard in minutes", desc:"Add your classes, sections, subjects and fee structure using our guided 4-step onboarding wizard." },
              { n:"03", title:"Go live", desc:"Share the login link with your staff. Start taking attendance, collecting fees and running your school." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="relative pl-6">
                <div className="absolute left-0 top-0 text-6xl font-black text-white/[0.04] leading-none select-none">{n}</div>
                <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-2">{n}</p>
                <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <p className="text-indigo-400 text-sm font-semibold uppercase tracking-widest mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-black text-white">Simple, transparent pricing</h2>
          <p className="text-slate-400 mt-4">All plans include every module. No per-module fees. No surprises.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            {
              name: "Starter",
              price: "Free",
              sub: "30-day free trial",
              hl: false,
              features: ["All 16 modules","Up to 200 students","Email support","Skula subdomain"],
            },
            {
              name: "Growth",
              price: "$29",
              sub: "per month",
              hl: true,
              features: ["Everything in Starter","Unlimited students","Priority WhatsApp support","Custom domain","SMS notifications","Data export"],
            },
            {
              name: "Enterprise",
              price: "Custom",
              sub: "contact us",
              hl: false,
              features: ["Everything in Growth","Dedicated instance","SLA guarantee","Staff training","Custom integrations","Onsite setup"],
            },
          ].map(({ name, price, sub, hl, features }) => (
            <div key={name} className={`rounded-2xl p-7 border ${hl ? "border-indigo-500 bg-indigo-600/5" : "border-white/5 bg-white/[0.02]"} relative`}>
              {hl && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-4 py-1 rounded-full">Most popular</div>}
              <p className="text-slate-400 text-sm font-semibold mb-3">{name}</p>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-black text-white">{price}</span>
                {price !== "Free" && price !== "Custom" && <span className="text-slate-500 text-sm">/mo</span>}
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
                href="/contact"
                className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                  hl ? "bg-indigo-600 text-white hover:bg-indigo-500" : "border border-white/10 text-slate-300 hover:bg-white/5"
                }`}
              >
                Get started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="border-t border-white/5 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-black text-white">Frequently asked questions</h2>
        </div>
        <div className="space-y-3">
          {[
            { q:"How long does setup take?", a:"Most schools are fully live — with classes, sections, fee types and staff accounts — within 30 minutes. We guide you step by step." },
            { q:"Do I need technical knowledge?", a:"None at all. If you can use WhatsApp, you can use Skula. We also offer free onboarding support." },
            { q:"Can multiple staff use it at the same time?", a:"Yes. Skula is multi-user by design. Teachers, accountants, librarians and admins each have their own login and access only what they need." },
            { q:"Is my data safe?", a:"Your data is stored in an isolated database schema — completely separate from other schools. We use Neon PostgreSQL with daily backups." },
            { q:"What happens after the free trial?", a:"You can upgrade to a paid plan or contact us. We never delete your data — we'll reach out before anything changes." },
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
        <div className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4">
            Ready to see it live?
          </h2>
          <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
            Try the demo in 30 seconds — no sign-up needed. Or chat with us on WhatsApp.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/demo" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-9 py-4 rounded-xl font-black text-base hover:bg-indigo-500 transition-colors shadow-2xl shadow-indigo-600/25">
              Try the demo <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366]/10 border border-[#25D366]/20 text-[#25D366] px-9 py-4 rounded-xl font-black text-base hover:bg-[#25D366]/20 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </a>
          </div>
          <p className="text-slate-600 text-sm mt-6">No card needed · Setup in 30 minutes · Cancel anytime</p>
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
                School management made simple for African schools. Built by{" "}
                <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 transition-colors">Novalss</a>.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  {[["Features","/features"],["Pricing","#pricing"],["Demo","/demo"]].map(([l,h])=>(
                    <a key={l} href={h} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Company</p>
                <div className="flex flex-col gap-2">
                  {[["Contact","/contact"],["Sign in","/sign-in"],["WhatsApp",WHATSAPP_URL]].map(([l,h])=>(
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-slate-500 hover:text-slate-300 text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-700 text-xs">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#25D366] text-xs font-semibold hover:text-[#20bd5a] transition-colors">
              <MessageCircle className="h-3.5 w-3.5" /> Chat with us
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
