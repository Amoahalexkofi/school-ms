import Link from "next/link";
import type { Metadata } from "next";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "Terms & Conditions — Skula",
  description: "The terms that apply to using Skula, including plans, pricing, billing, fair use and data.",
  alternates: { canonical: "/terms" },
};

const LAST_UPDATED = "21 June 2026";

const SECTIONS: { id: string; h: string; p: string[] }[] = [
  {
    id: "agreement",
    h: "Agreement",
    p: [
      "These Terms & Conditions (the “Terms”) govern your access to and use of Skula, a school management platform operated by Novalss Technology Solutions (“Skula”, “we”, “us”, “our”). By creating an account, subscribing, or otherwise using the service, your school (“you”) agrees to these Terms.",
    ],
  },
  {
    id: "plans-pricing",
    h: "Plans, pricing & billing",
    p: [
      "Prices are displayed in Ghana Cedis (GH₵) and are exclusive of any applicable taxes, levies, or payment-processor fees.",
      "The plan is billed either monthly or annually. Annual plans are paid in advance for twelve (12) months and include the advertised discount (equivalent to two months free).",
      "Current prices are introductory launch pricing and may change over time. We will give existing schools reasonable prior notice of any price change that affects them.",
      "Subscriptions renew automatically for the same period until cancelled. Enterprise pricing and terms are agreed separately in writing.",
    ],
  },
  {
    id: "fair-use",
    h: "“Unlimited” usage & fair use",
    p: [
      "Where a plan describes “unlimited” students or usage, this is subject to fair and reasonable use consistent with operating a single school. We may contact any school whose usage is materially beyond normal patterns to agree appropriate arrangements.",
    ],
  },
  {
    id: "messaging",
    h: "SMS, WhatsApp & email",
    p: [
      "Messaging features rely on third-party providers and may incur charges separate from your subscription. Where applicable, message allowances or credits are described at sign-up or sold as top-ups. The delivery and timing of messages depend on networks and providers and are not guaranteed.",
    ],
  },
  {
    id: "demo",
    h: "Live demo",
    p: [
      "The live demo is a shared environment provided for evaluation only. Its data may be reset periodically and must not be used to store real school records.",
    ],
  },
  {
    id: "cancellation",
    h: "Cancellation & refunds",
    p: [
      "You may cancel at any time; your plan remains active until the end of the current billing period. Monthly fees already paid are non-refundable. Annual plans may be refunded on a pro-rata basis at our discretion.",
    ],
  },
  {
    id: "your-data",
    h: "Your data",
    p: [
      "Your school owns its data. We process it solely to provide and improve the service, keep it secure, and back it up. You may request an export or deletion of your data at any time. We do not sell your data to third parties.",
    ],
  },
  {
    id: "availability",
    h: "Availability & support",
    p: [
      "We aim for high availability but do not guarantee uninterrupted service, except where a specific service-level agreement (SLA) is offered under an Enterprise plan. Support is provided through the channels listed for your plan.",
    ],
  },
  {
    id: "acceptable-use",
    h: "Acceptable use",
    p: [
      "You agree not to misuse the service, attempt to access other schools’ data, interfere with the platform, or use Skula for any unlawful purpose. We may suspend or terminate accounts that breach these Terms.",
    ],
  },
  {
    id: "liability",
    h: "Liability",
    p: [
      "To the extent permitted by law, Skula is provided “as is”. We are not liable for indirect or consequential losses, and our total liability for any claim is limited to the fees you paid in the three (3) months before the claim arose.",
    ],
  },
  {
    id: "changes",
    h: "Changes & governing law",
    p: [
      "We may update these Terms from time to time; the current version will always be available on this page, with the “last updated” date above. Continued use after changes means you accept them. These Terms are governed by the laws of the Republic of Ghana.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SkulaNav />

      {/* Header band */}
      <header className="border-b border-[#e3e8ee] bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">
          <p className="text-[11px] font-bold text-[#533afd] uppercase tracking-[0.16em] mb-3">Legal</p>
          <h1 className="text-[34px] sm:text-[44px] font-light tracking-[-0.02em] text-[#0d253d]">
            Terms &amp; Conditions
          </h1>
          <p className="text-[#64748d] text-[14px] mt-4">
            Last updated {LAST_UPDATED} · Novalss Technology Solutions
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:grid lg:grid-cols-[210px_1fr] lg:gap-14">
        {/* Table of contents (sticky on desktop) */}
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-[11px] font-bold text-[#64748d] uppercase tracking-wider mb-3">On this page</p>
            <ul className="space-y-2 border-l border-[#e3e8ee]">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}
                    className="block -ml-px border-l border-transparent hover:border-indigo-400 pl-3 text-[13px] text-[#64748d] hover:text-[#533afd] transition-colors">
                    {i + 1}. {s.h}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Content */}
        <article className="max-w-2xl">
          {SECTIONS.map((s, i) => (
            <section key={s.id} id={s.id} className="scroll-mt-28 mb-10">
              <h2 className="text-[19px] font-bold text-[#0d253d] mb-3">
                <span className="text-slate-300 font-semibold mr-2">{i + 1}.</span>{s.h}
              </h2>
              {s.p.map((para, j) => (
                <p key={j} className="text-[15px] text-[#273951] leading-[1.7] mb-3">{para}</p>
              ))}
            </section>
          ))}

          {/* Contact box */}
          <div className="mt-12 rounded-2xl border border-[#e3e8ee] bg-slate-50 p-6">
            <h3 className="text-[15px] font-bold text-[#0d253d]">Questions about these terms?</h3>
            <p className="text-[14px] text-[#64748d] mt-1.5 mb-4">We're happy to clarify anything before you sign up.</p>
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Contact us
            </Link>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-[#e3e8ee]">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-[13px] font-semibold text-[#533afd] hover:underline">← Back to home</Link>
          <div className="flex items-center gap-4 text-[12px] text-[#64748d]">
            <Link href="/privacy" className="hover:text-[#273951]">Privacy</Link>
            <span>© {new Date().getFullYear()} Novalss Technology Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
