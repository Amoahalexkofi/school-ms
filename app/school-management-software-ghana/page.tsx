import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, CheckCircle2, Users, DollarSign, ClipboardList, BookOpen,
  MessageSquare, BarChart3, Smartphone, Shield, Clock, Globe,
} from "lucide-react";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "School Management Software in Ghana | Skula",
  description:
    "Skula is school management software built for Ghana — admissions, fees, attendance, exams, payroll and parent communication in one platform. GH₵199/mo, all 15 modules included.",
  alternates: { canonical: "/school-management-software-ghana" },
};

const REASONS = [
  { icon: Globe,        title: "Built for Ghana",        text: "GH₵ pricing, WAEC/BECE-ready report cards, GES grading scales, and mobile money fee collection — not a foreign template bolted on." },
  { icon: DollarSign,   title: "All 15 modules, one price", text: "Admissions, fees, attendance, exams, payroll, transport, hostel, library — no per-feature upsells or locked tiers." },
  { icon: Smartphone,   title: "Works on low bandwidth",  text: "Runs smoothly on the connections and devices Ghanaian schools actually have, on desktop or phone." },
  { icon: Shield,       title: "Your data stays yours",   text: "Hosted securely with daily backups. No lock-in — export your records any time." },
  { icon: Clock,        title: "Live in under 30 minutes", text: "We set your school up with you — no lengthy IT project, no consultants required." },
  { icon: MessageSquare, title: "WhatsApp & SMS built in", text: "Fee receipts, attendance alerts and announcements reach parents where they already are." },
];

const MODULES = [
  { icon: Users,          name: "Admissions & Students", text: "Online admission forms, student profiles, ID cards, class promotion." },
  { icon: DollarSign,     name: "Fees & Payments",       text: "GHS receipts, mobile money & card payments, defaulter tracking, term reports." },
  { icon: ClipboardList,  name: "Attendance",             text: "Daily class attendance with instant absentee alerts to parents." },
  { icon: BookOpen,       name: "Exams & Report Cards",   text: "GES continuous assessment (SBA), terminal reports, custom grading scales." },
  { icon: BarChart3,      name: "Payroll & HR",           text: "Staff records, payroll processing, leave management." },
  { icon: MessageSquare,  name: "Parent Communication",   text: "WhatsApp & SMS alerts, a dedicated parent portal, school notices." },
];

const FAQS = [
  {
    q: "How much does school management software cost in Ghana?",
    a: "Skula starts at GH₵199/month or GH₵1,990/year (save 2 months), with every module included — no per-feature add-ons. Multi-year prepay plans (5 or 7 years) lock in a lower rate. See the full pricing at getskula.com/#pricing.",
  },
  {
    q: "Do we need to buy new computers or servers?",
    a: "No. Skula runs in a web browser on any existing computer, tablet or phone — nothing to install, nothing to maintain on-site.",
  },
  {
    q: "Can we switch from paper registers and Excel?",
    a: "Yes. We import your existing student, staff and fee records from a spreadsheet as part of setup, so you don't start from zero.",
  },
  {
    q: "Does it support Ghana Education Service (GES) report formats?",
    a: "Yes — continuous assessment (SBA), terminal report sheets, and configurable grading scales match what Ghanaian basic and senior high schools use.",
  },
  {
    q: "Can parents pay fees with mobile money?",
    a: "Yes. Parents can pay fees online via mobile money or card, and receive an automatic GHS receipt — no more chasing paper receipts.",
  },
  {
    q: "What if my school has more than one campus?",
    a: "Multi Branch is available as an add-on on any paid plan — each branch runs its own students, staff, fees and attendance, with a combined view for head office.",
  },
];

export default function SchoolManagementSoftwareGhanaPage() {
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
              "radial-gradient(90% 80% at 0% 35%, rgba(185,185,249,0.40) 0%, transparent 60%)",
              "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
            ].join(", "),
            clipPath: "polygon(0 0, 100% 0, 100% 72%, 0 100%)",
          }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[#e3e8ee] bg-white/80 text-[#4434d4] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full" />
            Built for schools in Ghana
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#0d253d] tracking-[-0.025em] leading-[1.04]">
            School management software,<br />
            <span className="text-[#533afd]">made for Ghana.</span>
          </h1>
          <p className="mt-6 text-[#64748d] text-xl leading-relaxed max-w-2xl mx-auto">
            Skula replaces paper registers, Excel fee ledgers and scattered WhatsApp groups with one platform —
            admissions, fees, attendance, exams, payroll and parent communication, priced in GH₵.
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

      {/* WHY GHANAIAN SCHOOLS CHOOSE SKULA */}
      <section className="py-14 sm:py-24 bg-white border-t border-[#e3e8ee]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">Why Skula</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">Not a foreign template. Built for here.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {REASONS.map(({ icon: Icon, title, text }) => (
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

      {/* MODULES */}
      <section className="py-14 sm:py-24 bg-[#f6f9fc] border-t border-[#e3e8ee]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">What's included</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">Everything a Ghanaian school runs on.</h2>
            <p className="text-[#64748d] text-[15px] mt-4 max-w-xl mx-auto">15 modules in total — this is the core. See the full list on the <Link href="/features" className="text-[#533afd] font-medium hover:underline">features page</Link>.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {MODULES.map(({ icon: Icon, name, text }) => (
              <div key={name} className="bg-white border border-[#e3e8ee] rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl bg-[#533afd] flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-[15px] font-bold text-[#0d253d] mb-1.5">{name}</h3>
                <p className="text-[13.5px] text-[#64748d] leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING TEASER */}
      <section className="py-14 sm:py-20 bg-white border-t border-[#e3e8ee]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">Pricing</p>
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">GH₵199/month. All 15 modules.</h2>
          <p className="text-[#64748d] text-[15px] mt-4">No per-feature pricing, no hidden add-ons. Annual billing saves 2 months.</p>
          <Link href="/#pricing" className="inline-flex items-center justify-center gap-2 mt-8 bg-[#533afd] text-white px-8 py-3.5 rounded-full font-medium hover:bg-[#665efd] transition-colors">
            See full pricing <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-14 sm:py-24 bg-[#f6f9fc] border-t border-[#e3e8ee]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.14em] mb-4">FAQ</p>
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">Common questions.</h2>
          </div>
          <div className="bg-white rounded-2xl border border-[#e3e8ee] divide-y divide-[#e3e8ee]" style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
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
            Ready to run your school<br /><span className="text-[#b9b9f9]">on one platform?</span>
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
