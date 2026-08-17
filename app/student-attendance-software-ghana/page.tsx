import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, ClipboardList, Bell, BarChart3, Smartphone, Clock, Users,
} from "lucide-react";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "Student Attendance Software Ghana | Skula",
  description:
    "Track student attendance digitally with instant absentee alerts to parents by WhatsApp & SMS. Skula's attendance module — part of every GH₵199/mo plan, no separate purchase.",
  alternates: { canonical: "/student-attendance-software-ghana" },
};

const CAPABILITIES = [
  { icon: ClipboardList, title: "Daily class attendance",     text: "Teachers mark attendance in seconds from any device — no more paper registers to file and search." },
  { icon: Bell,          title: "Instant absentee alerts",    text: "Parents get a WhatsApp or SMS alert the moment their child is marked absent — same day, not next week." },
  { icon: BarChart3,     title: "Attendance reports",         text: "See attendance rate by student, class or term — spot patterns before they become a problem." },
  { icon: Smartphone,    title: "Works on any device",        text: "Mark attendance from a phone, tablet or computer — built for classrooms with limited hardware." },
  { icon: Clock,         title: "Saves teachers real time",   text: "What used to take minutes with a paper register takes seconds — more class time, less admin." },
  { icon: Users,         title: "One record, whole school",   text: "Attendance data connects to report cards and parent communication automatically — entered once." },
];

const FAQS = [
  {
    q: "How do teachers mark attendance?",
    a: "From the Attendance module on any device — phone, tablet or computer. It takes seconds per class, and there's no paper register to keep or lose.",
  },
  {
    q: "Do parents get notified when a student is absent?",
    a: "Yes — an absentee alert goes out by WhatsApp or SMS the same day a student is marked absent.",
  },
  {
    q: "Is attendance tracking a separate module we have to pay for?",
    a: "No. Attendance is included in every Skula plan at GH₵199/month, along with 14 other modules — there's nothing extra to buy.",
  },
  {
    q: "Can we see attendance trends over a term?",
    a: "Yes — attendance reports break down rate by student, class or term, so you can spot patterns like chronic lateness or absenteeism early.",
  },
];

export default function StudentAttendanceSoftwareGhanaPage() {
  return (
    <div className="min-h-screen bg-white text-[#0d253d] antialiased">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQS.map(f => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />

      <SkulaNav />

      {/* HERO */}
      <section className="relative pt-24 sm:pt-36 pb-14 sm:pb-20 overflow-hidden bg-white">
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none"
          style={{
            background: [
              "radial-gradient(110% 80% at 85% 0%, rgba(83,58,253,0.30) 0%, transparent 55%)",
              "radial-gradient(70% 60% at 100% 40%, rgba(234,34,97,0.16) 0%, transparent 55%)",
              "radial-gradient(80% 70% at 25% 0%, rgba(245,233,212,0.85) 0%, transparent 65%)",
              "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
            ].join(", "),
            clipPath: "polygon(0 0, 100% 0, 100% 72%, 0 100%)",
          }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[#e3e8ee] bg-white/80 text-[#4434d4] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full" />
            Attendance — included in every plan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#0d253d] tracking-[-0.025em] leading-[1.04]">
            Attendance, marked in seconds.<br />
            <span className="text-[#533afd]">Parents notified instantly.</span>
          </h1>
          <p className="mt-6 text-[#64748d] text-xl leading-relaxed max-w-2xl mx-auto">
            Skula's attendance module replaces the paper register — teachers mark attendance from any device, and
            parents get a WhatsApp or SMS alert the moment a student is absent.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#533afd] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#665efd] transition-colors">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/demo" className="inline-flex items-center justify-center gap-2 border border-[#e3e8ee] text-[#0d253d] px-8 py-3.5 rounded-full font-medium hover:border-[#b9b9f9] transition-colors">
              Try the live demo
            </Link>
          </div>
        </div>
      </section>

      {/* CAPABILITIES */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#e3e8ee]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">What it does</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">The register, without the paper.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-[#e3e8ee] rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl bg-[#f6f9fc] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-[#533afd]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0d253d] mb-1.5">{title}</h3>
                <p className="text-[13.5px] text-[#64748d] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-14 sm:py-20 bg-[#f6f9fc] border-t border-[#e3e8ee]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">No separate attendance app to buy.</h2>
          <p className="text-[#64748d] text-[15px] mt-4">Attendance is one of 15 modules included in every Skula plan, from GH₵199/month.</p>
          <Link href="/#pricing" className="inline-flex items-center justify-center gap-2 mt-8 bg-[#533afd] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#665efd] transition-colors">
            See full pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#e3e8ee]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">Common questions.</h2>
          </div>
          <div className="bg-[#f6f9fc] rounded-2xl border border-[#e3e8ee] divide-y divide-[#e3e8ee]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {FAQS.map(({ q, a }) => (
              <div key={q} className="px-6 py-5">
                <h3 className="text-[15px] font-semibold text-[#0d253d]">{q}</h3>
                <p className="text-[13.5px] text-[#64748d] mt-2 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="py-14 sm:py-24" style={{ background: "#1c1e54" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl sm:text-5xl font-light text-white tracking-[-0.02em]">
            Ready to retire<br /><span className="text-[#b9b9f9]">the paper register?</span>
          </h2>
          <p className="mt-5 text-[#b3c3e0] text-lg">Free demo. No card required. Live in under 30 minutes.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center mt-10">
            <Link href="/contact" className="inline-flex items-center justify-center gap-2 bg-[#533afd] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#665efd] transition-colors">
              Get started <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/" className="inline-flex items-center justify-center gap-2 border border-white/25 text-white px-8 py-3.5 rounded-full font-medium hover:bg-white/10 transition-colors">
              Back to home
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-[#e3e8ee] py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <img src="/images/skula-logomark.png" alt="Skula" className="h-7 object-contain" />
          <p className="text-xs text-[#64748d]">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
          <div className="flex gap-5">
            <Link href="/" className="text-[13px] font-medium text-[#64748d] hover:text-[#0d253d] transition-colors">Home</Link>
            <Link href="/features" className="text-[13px] font-medium text-[#64748d] hover:text-[#0d253d] transition-colors">Features</Link>
            <Link href="/#pricing" className="text-[13px] font-medium text-[#64748d] hover:text-[#0d253d] transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
