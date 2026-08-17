import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, DollarSign, Smartphone, Bell, FileText, ShieldCheck, TrendingUp,
} from "lucide-react";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "School Fees Management Software Ghana | Skula",
  description:
    "Collect school fees online with mobile money & card, track defaulters automatically, and send instant GHS receipts by WhatsApp. Skula's fee module — part of every GH₵199/mo plan.",
  alternates: { canonical: "/school-fees-management-software-ghana" },
};

const CAPABILITIES = [
  { icon: Smartphone, title: "Mobile money & card payments", text: "Parents pay fees online from their phone — no more cash handling or bank queues at school." },
  { icon: FileText,   title: "Automatic GHS receipts",       text: "Every payment generates a receipt instantly, sent straight to the parent. No manual receipt books." },
  { icon: Bell,       title: "Defaulter tracking & reminders", text: "See exactly who owes what, per term or class, and send WhatsApp reminders in one click." },
  { icon: TrendingUp, title: "Term-by-term fee reports",     text: "Collected vs. pending vs. overdue, by class or the whole school — exportable for your accountant." },
  { icon: ShieldCheck, title: "Every payment reconciled",    text: "Payments post directly to each student's ledger — no spreadsheet double-entry, no lost records." },
  { icon: DollarSign, title: "Flexible fee structures",      text: "Set different fee categories and amounts per class, term or session — tuition, feeding, transport, PTA dues." },
];

const FAQS = [
  {
    q: "Can parents pay school fees with mobile money?",
    a: "Yes. Parents pay online with mobile money or card, and get an automatic GHS receipt — no cash handling at the school office.",
  },
  {
    q: "How do I know which parents haven't paid?",
    a: "The Fees dashboard shows defaulters by class or term in real time, and you can send a WhatsApp reminder directly from the same screen.",
  },
  {
    q: "Is fee collection a separate paid add-on?",
    a: "No. Fees & Payments is one of the 15 modules included in every Skula plan at GH₵199/month — there's no extra fee module to buy.",
  },
  {
    q: "Can I set different fees per class or term?",
    a: "Yes — fee categories and amounts are fully configurable per class, per term, and per academic session.",
  },
  {
    q: "Can our accountant get a report of fees collected?",
    a: "Yes — term-by-term collection reports (collected, pending, overdue) can be viewed on screen or exported for your accountant or board.",
  },
];

export default function SchoolFeesManagementSoftwareGhanaPage() {
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
              "radial-gradient(110% 80% at 85% 0%, rgba(16,185,129,0.22) 0%, transparent 55%)",
              "radial-gradient(70% 60% at 100% 40%, rgba(83,58,253,0.20) 0%, transparent 55%)",
              "radial-gradient(80% 70% at 25% 0%, rgba(245,233,212,0.85) 0%, transparent 65%)",
              "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
            ].join(", "),
            clipPath: "polygon(0 0, 100% 0, 100% 72%, 0 100%)",
          }} />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 border border-[#e3e8ee] bg-white/80 text-[#4434d4] text-xs font-semibold px-3.5 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full" />
            Fees & Payments — included in every plan
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light text-[#0d253d] tracking-[-0.025em] leading-[1.04]">
            Stop chasing fees.<br />
            <span className="text-[#533afd]">Start collecting them.</span>
          </h1>
          <p className="mt-6 text-[#64748d] text-xl leading-relaxed max-w-2xl mx-auto">
            Skula's fee module lets Ghanaian schools collect fees online by mobile money or card, track defaulters
            automatically, and send instant GHS receipts — replacing the receipt book and the debtors ledger.
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
            <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">Fee collection, without the chasing.</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {CAPABILITIES.map(({ icon: Icon, title, text }) => (
              <div key={title} className="border border-[#e3e8ee] rounded-2xl p-6" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-emerald-600" />
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
          <h2 className="text-3xl sm:text-4xl font-light tracking-tight text-[#0d253d]">No separate fee module to buy.</h2>
          <p className="text-[#64748d] text-[15px] mt-4">Fees & Payments is one of 15 modules included in every Skula plan, from GH₵199/month.</p>
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
            Ready to stop chasing<br /><span className="text-[#b9b9f9]">fee payments?</span>
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
