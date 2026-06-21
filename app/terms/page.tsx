import Link from "next/link";
import type { Metadata } from "next";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "Terms & Conditions — Skula",
  description: "The terms that apply to using Skula, including plans, pricing, billing, fair use and data.",
  alternates: { canonical: "/terms" },
};

const SECTIONS: { h: string; p: string[] }[] = [
  {
    h: "1. Agreement",
    p: [
      "These Terms & Conditions govern your use of Skula, a school management platform operated by Novalss Ltd (“Skula”, “we”, “us”). By creating an account, subscribing, or using the service, your school agrees to these terms.",
    ],
  },
  {
    h: "2. Plans, pricing & billing",
    p: [
      "Prices are shown in Ghana Cedis (GH₵) and are exclusive of any applicable taxes or payment-processor fees.",
      "The Complete plan is billed monthly or annually. Annual plans are paid in advance for twelve (12) months and include the advertised discount.",
      "Prices are introductory launch pricing and may change over time. We will give existing schools reasonable notice before any price change affecting them.",
      "Subscriptions renew automatically until cancelled. Enterprise pricing is agreed separately in writing.",
    ],
  },
  {
    h: "3. “Unlimited” & fair use",
    p: [
      "Where a plan describes “unlimited” students or usage, this is subject to fair and reasonable use consistent with operating a single school. We may contact schools whose usage is materially beyond normal patterns to agree appropriate terms.",
    ],
  },
  {
    h: "4. SMS, WhatsApp & email",
    p: [
      "Messaging features may depend on third-party providers and can incur separate charges. Message allowances or credits, where applicable, are described at sign-up or sold as top-ups. Delivery and timing of messages are not guaranteed and depend on networks and providers.",
    ],
  },
  {
    h: "5. Free demo",
    p: [
      "The live demo is a shared environment for evaluation only. Its data may be reset periodically and must not be used for real school records.",
    ],
  },
  {
    h: "6. Cancellation & refunds",
    p: [
      "You may cancel at any time; your plan remains active until the end of the current billing period. Monthly fees already paid are non-refundable. Annual plans may be refunded on a pro-rata basis at our discretion.",
    ],
  },
  {
    h: "7. Your data",
    p: [
      "Your school owns its data. We process it solely to provide the service, keep it secure, and back it up. You can request an export or deletion of your data. We do not sell your data.",
    ],
  },
  {
    h: "8. Availability & support",
    p: [
      "We aim for high availability but do not guarantee uninterrupted service except where a specific service-level agreement (SLA) is offered under an Enterprise plan. Support is provided through the channels listed for your plan.",
    ],
  },
  {
    h: "9. Acceptable use",
    p: [
      "You agree not to misuse the service, attempt to access other schools’ data, or use Skula for unlawful purposes. We may suspend accounts that breach these terms.",
    ],
  },
  {
    h: "10. Changes & contact",
    p: [
      "We may update these terms from time to time; the latest version will always be available on this page. These terms are governed by the laws of Ghana.",
      "Questions? Contact us via the contact page.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <SkulaNav />
      <main className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em] mb-3">Legal</p>
        <h1 className="text-[34px] sm:text-[40px] font-black tracking-tight text-slate-900">Terms &amp; Conditions</h1>
        <p className="text-slate-500 text-[14px] mt-3">Last updated: 21 June 2026</p>

        <div className="mt-10 space-y-8">
          {SECTIONS.map((s) => (
            <section key={s.h}>
              <h2 className="text-[17px] font-bold text-slate-900 mb-2">{s.h}</h2>
              {s.p.map((para, i) => (
                <p key={i} className="text-[14.5px] text-slate-600 leading-relaxed mb-2">{para}</p>
              ))}
            </section>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-slate-100 text-[13px] text-slate-400">
          <Link href="/" className="text-indigo-600 font-semibold hover:underline">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
