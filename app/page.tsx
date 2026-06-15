import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
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
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-9">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm shadow-indigo-200">
                <GraduationCap className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="font-black text-slate-900 text-base tracking-tight">Skula</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {[["Features","/features"],["Pricing","#pricing"],["FAQ","#faq"]].map(([l,h])=>(
                <a key={l} href={h} className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="hidden sm:block text-sm font-medium text-slate-500 hover:text-slate-900 px-3 py-2 transition-colors">
              Sign in
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 text-sm font-semibold px-3.5 py-2 rounded-lg hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              <WhatsAppIcon className="h-3.5 w-3.5 text-[#25D366]" />
              WhatsApp
            </a>
            <Link href="/demo" className="inline-flex items-center gap-1.5 bg-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-200">
              Try demo <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-16"
        style={{ background: "linear-gradient(150deg, #eef2ff 0%, #e0f2fe 50%, #f0fdf4 100%)" }}>
        {/* Soft blobs */}
        <div className="absolute top-0 right-[10%] w-[500px] h-[500px] bg-indigo-100 rounded-full blur-[120px] opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-sky-100 rounded-full blur-[100px] opacity-40 pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end">

            {/* Left — text */}
            <div className="pb-16 lg:pb-20">
              <div className="inline-flex items-center gap-2 bg-white/80 border border-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 shadow-sm">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                Built for schools in Ghana — JHS, SHS &amp; Basic
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[56px] font-black leading-[1.08] tracking-tight text-slate-900">
                The smarter way<br />
                to run your<br />
                <span className="text-indigo-600">Ghanaian school.</span>
              </h1>

              <p className="mt-5 text-slate-600 text-[17px] leading-relaxed max-w-md">
                Students, fees, attendance, exams and staff — all in one system designed
                for how schools in Ghana actually work.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-3 mt-8">
                <Link
                  href="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-bold text-[15px] hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
                >
                  Try it free <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href={WHATSAPP_URL}
                  target="_blank" rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-7 py-3.5 rounded-xl font-bold text-[15px] transition-colors shadow-lg shadow-green-100"
                >
                  <WhatsAppIcon className="h-[18px] w-[18px]" />
                  Chat on WhatsApp
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6">
                {["50+ schools","Free 30-day trial","No credit card"].map((t) => (
                  <span key={t} className="flex items-center gap-1.5 text-slate-500 text-xs">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />{t}
                  </span>
                ))}
              </div>
            </div>

            {/* Right — photo */}
            <div className="relative hidden lg:flex items-end justify-center">
              {/* Floating stat cards */}
              <div className="absolute top-8 left-0 z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-slate-900 text-sm font-black">GHS 84,500</p>
                  <p className="text-slate-400 text-[10px]">Fees collected this term</p>
                </div>
              </div>
              <div className="absolute top-28 right-[-16px] z-10 bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-3">
                <p className="text-slate-400 text-[10px] mb-1">Attendance today</p>
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: "94%" }} />
                  </div>
                  <span className="text-slate-900 text-xs font-black">94%</span>
                </div>
              </div>

              <div className="relative w-[480px] h-[480px] rounded-3xl overflow-hidden shadow-2xl shadow-indigo-100 border border-white/60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80"
                  alt="Students in a Ghanaian school"
                  className="w-full h-full object-cover"
                />
                {/* Subtle gradient overlay at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-indigo-900/20 to-transparent" />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── STATS BAR ── */}
      <section className="bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-3 gap-6 text-center">
          {[
            { n: "50+",      l: "Schools using Skula" },
            { n: "16",       l: "Modules included" },
            { n: "< 30 min", l: "To go fully live" },
          ].map(({ n, l }) => (
            <div key={l}>
              <p className="text-3xl sm:text-4xl font-black text-indigo-600">{n}</p>
              <p className="text-slate-500 text-sm mt-1">{l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PAIN POINTS ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Sound familiar?</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">
              Every school in Ghana deals with this.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
              <div key={before} className="rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-sm">
                <div className="px-5 py-4 bg-red-50 border-b border-red-100">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-red-500 mb-2">Before</p>
                  <p className="text-slate-600 text-sm leading-relaxed">{before}</p>
                </div>
                <div className="px-5 py-4 bg-emerald-50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-600 mb-2">With Skula</p>
                  <p className="text-slate-700 text-sm leading-relaxed">{after}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DASHBOARD MOCKUP ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">The product</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Everything in one dashboard</h2>
          </div>
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-200/80">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-100 bg-slate-50">
              <span className="w-3 h-3 rounded-full bg-red-400" />
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className="w-3 h-3 rounded-full bg-green-400" />
              <div className="mx-auto bg-white border border-slate-200 rounded-md px-12 py-1 text-slate-400 text-xs shadow-sm">getskula.com/dashboard</div>
            </div>
            <div className="flex bg-white">
              {/* Sidebar */}
              <div className="hidden md:flex flex-col w-44 shrink-0 border-r border-slate-100 p-3 gap-0.5 bg-white">
                {["Dashboard","Students","Fees","Attendance","Exams","Reports"].map((item, i) => (
                  <div key={item} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs ${
                    i === 0 ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-slate-400"
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-slate-200"}`} />
                    {item}
                  </div>
                ))}
              </div>
              {/* Main */}
              <div className="flex-1 p-5 bg-slate-50">
                <p className="text-slate-900 text-sm font-bold mb-4">GoldCoast Academy <span className="text-slate-400 font-normal">· 2025/2026</span></p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                  {[
                    { label:"Students",    val:"342",    color:"bg-indigo-500",  light:"bg-indigo-50" },
                    { label:"Staff",       val:"28",     color:"bg-violet-500",  light:"bg-violet-50" },
                    { label:"Fees (GHS)",  val:"84,500", color:"bg-emerald-500", light:"bg-emerald-50" },
                    { label:"Attendance",  val:"94%",    color:"bg-amber-500",   light:"bg-amber-50" },
                  ].map(({ label, val, color, light }) => (
                    <div key={label} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <div className={`w-8 h-8 rounded-lg ${light} flex items-center justify-center mb-2`}>
                        <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      </div>
                      <p className="text-slate-900 text-xl font-black">{val}</p>
                      <p className="text-slate-400 text-[10px] mt-0.5 uppercase tracking-wide">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-xs font-semibold mb-3">Recent payments</p>
                    {[["Kwame Asante","GHS 450"],["Abena Mensah","GHS 380"],["Kofi Tawiah","GHS 600"]].map(([n,a])=>(
                      <div key={n} className="flex justify-between py-1.5 border-b border-slate-50 last:border-0">
                        <span className="text-slate-600 text-xs">{n}</span>
                        <span className="text-emerald-600 text-xs font-bold">{a}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                    <p className="text-slate-500 text-xs font-semibold mb-3">Attendance this week</p>
                    <div className="flex items-end gap-1 h-16">
                      {[82,88,91,79,95,87,93].map((h,i)=>(
                        <div key={i} className="flex-1 bg-indigo-100 rounded-sm relative">
                          <div className="absolute bottom-0 left-0 right-0 bg-indigo-500 rounded-sm" style={{ height: `${h}%` }} />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-2">
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

      {/* ── FEATURES ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Everything built in</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">16 modules. Zero extra cost.</h2>
            <p className="text-slate-500 mt-4 max-w-xl mx-auto">
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
              <div key={title} className="group bg-white p-6 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:shadow-md transition-all duration-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                  <Icon className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="text-slate-900 font-bold text-base mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/features" className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-700 font-semibold text-sm transition-colors">
              See all 16 modules <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">From the people using it</p>
            <h2 className="text-3xl font-black text-slate-900">What school leaders are saying</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                quote: "Before Skula, I was spending every Friday afternoon printing fee receipts by hand. Now my accountant does it all from the system and I don't hear about it until the monthly report.",
                name:  "Mrs. Adjoa Asante",
                role:  "Headmistress",
                school:"GoldCoast Academy, Accra",
                init:  "AA",
                color: "bg-indigo-600",
              },
              {
                quote: "The exam module saved us an entire week. We used to type report cards in Word, print, retype when there were errors. Now we enter marks once and Skula does everything else.",
                name:  "Mr. Kofi Acheampong",
                role:  "Director",
                school:"Tema Community JHS",
                init:  "KA",
                color: "bg-violet-600",
              },
              {
                quote: "Parents actually pay faster because they get a WhatsApp receipt the moment the accountant records it. Our term 2 collections improved by nearly 30% after we started using Skula.",
                name:  "Mrs. Ama Boateng",
                role:  "Principal",
                school:"Sunflower Int'l School, Kumasi",
                init:  "AB",
                color: "bg-emerald-600",
              },
            ].map(({ quote, name, role, school, init, color }) => (
              <div key={name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map(i => (
                    <svg key={i} className="h-4 w-4 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                    </svg>
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed flex-1 italic">"{quote}"</p>
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

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Simple to start</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Live in under 30 minutes</h2>
            <p className="text-slate-500 mt-3 max-w-lg mx-auto text-sm">
              We don't just hand you a system and disappear. We set it up with you.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { n:"1", title:"Send us a message",    desc:"WhatsApp or fill the contact form. We'll create your school account and be ready before the call ends." },
              { n:"2", title:"We onboard together",  desc:"Add your classes, sections, subjects and fee types. Our 4-step wizard walks you through everything in 20 minutes." },
              { n:"3", title:"Your school goes live", desc:"Share logins with your teachers and accountant. Start taking attendance, collecting fees and printing report cards today." },
            ].map(({ n, title, desc }) => (
              <div key={n} className="bg-white rounded-2xl border border-slate-100 p-7 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-base mb-5">{n}</div>
                <h3 className="text-slate-900 font-bold text-lg mb-2">{title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a
              href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-[#25D366] hover:bg-[#1fba5a] text-white px-7 py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md shadow-green-100"
            >
              <WhatsAppIcon className="h-4 w-4" />
              Start the conversation on WhatsApp
            </a>
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-indigo-600 text-sm font-bold uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900">Clear pricing. No surprises.</h2>
            <p className="text-slate-500 mt-4">Every plan includes all 16 modules. No per-module fees. Prices in GHS.</p>
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
              <div key={name} className={`rounded-2xl p-7 border relative ${
                hl
                  ? "bg-indigo-600 border-indigo-600 shadow-xl shadow-indigo-100"
                  : "bg-white border-slate-200 shadow-sm"
              }`}>
                {hl && <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-800 text-white text-xs font-bold px-4 py-1 rounded-full whitespace-nowrap">Most popular</div>}
                <p className={`text-sm font-semibold mb-3 ${hl ? "text-indigo-200" : "text-slate-500"}`}>{name}</p>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-3xl font-black ${hl ? "text-white" : "text-slate-900"}`}>{price}</span>
                </div>
                <p className={`text-xs mb-7 ${hl ? "text-indigo-300" : "text-slate-400"}`}>{sub}</p>
                <ul className="space-y-2.5 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-start gap-2.5 text-sm ${hl ? "text-indigo-100" : "text-slate-600"}`}>
                      <CheckCircle2 className={`h-4 w-4 shrink-0 mt-0.5 ${hl ? "text-indigo-300" : "text-indigo-500"}`} />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href={href}
                  className={`block text-center py-3 rounded-xl font-bold text-sm transition-colors ${
                    hl
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-indigo-600 text-white hover:bg-indigo-700"
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
      <section id="faq" className="bg-slate-50 py-20">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-slate-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-2">
            {[
              { q: "How long does it actually take to set up?",
                a: "Most schools are fully live — classes, sections, fee types and staff accounts all configured — in under 30 minutes. We stay on the call with you until everything is ready." },
              { q: "Do I need any technical knowledge?",
                a: "None at all. If you can use WhatsApp, you can use Skula. We also offer free onboarding support for every school." },
              { q: "Can my accountant, teachers and admin use it at the same time?",
                a: "Yes. Each staff member gets their own login with access only to what they need. The accountant sees fees, the teacher sees their classes, the admin sees everything." },
              { q: "Is the data for my school kept separate from other schools?",
                a: "Completely. Each school runs in an isolated database. No other school can ever see your students, fees, or any records." },
              { q: "What happens when the free trial ends?",
                a: "We'll reach out before anything changes. Your data is never deleted. You can upgrade, or we'll work something out — we won't leave you stuck." },
              { q: "Does it work for Basic, JHS and SHS schools?",
                a: "Yes. Skula supports all levels of the Ghanaian school system. We have BECE candidate tracking, JHS grading scales, and term-based academic calendars built in." },
            ].map(({ q, a }, i) => (
              <details key={i} className="group bg-white border border-slate-100 rounded-xl overflow-hidden shadow-sm">
                <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer text-slate-900 font-semibold text-sm list-none hover:bg-slate-50 transition-colors">
                  {q}
                  <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-5 pb-4 text-slate-500 text-sm leading-relaxed border-t border-slate-100 pt-4">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section style={{ background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 50%, #3730a3 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <p className="text-indigo-300 text-sm font-bold uppercase tracking-widest mb-4">Ready when you are</p>
          <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">
            Your school deserves<br />a proper system.
          </h2>
          <p className="text-indigo-200 text-base mb-10 max-w-lg mx-auto leading-relaxed">
            Try the live demo now — no sign-up needed. Or send us a WhatsApp message and
            we'll set everything up with you today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/demo"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-600 px-9 py-4 rounded-xl font-black text-base hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Try the demo free <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={WHATSAPP_URL}
              target="_blank" rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-9 py-4 rounded-xl font-black text-base transition-colors shadow-lg"
            >
              <WhatsAppIcon className="h-5 w-5" />
              WhatsApp us now
            </a>
          </div>
          <p className="text-indigo-300 text-sm mt-6">Free 30-day trial · GHS 299/mo after · Cancel anytime</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex flex-col md:flex-row items-start justify-between gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="font-black text-white text-sm tracking-tight">Skula</span>
              </div>
              <p className="text-slate-500 text-xs max-w-xs leading-relaxed">
                School management built for Ghanaian schools.<br />
                By <a href="https://novalss.com" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">Novalss</a>.
              </p>
            </div>
            <div className="flex gap-12">
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Product</p>
                <div className="flex flex-col gap-2">
                  {[["Features","/features"],["Pricing","#pricing"],["Demo","/demo"],["Contact","/contact"]].map(([l,h])=>(
                    <a key={l} href={h} className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wide mb-3">Company</p>
                <div className="flex flex-col gap-2">
                  {[["Sign in","/sign-in"],["Novalss","https://novalss.com"],["WhatsApp",WHATSAPP_URL]].map(([l,h])=>(
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-slate-600 text-xs">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] text-xs font-semibold px-3 py-1.5 rounded-full transition-colors">
              <WhatsAppIcon className="h-3 w-3" /> Chat with us on WhatsApp
            </a>
          </div>
        </div>
      </footer>

    </div>
  );
}
