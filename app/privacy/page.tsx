import Link from "next/link";
import type { Metadata } from "next";
import { SkulaNav } from "@/components/SkulaNav";

export const metadata: Metadata = {
  title: "Privacy Policy — Skula",
  description: "How Skula collects, uses, protects and shares data, and the rights of schools, staff, students and parents.",
  alternates: { canonical: "/privacy" },
};

const LAST_UPDATED = "21 June 2026";

const SECTIONS: { id: string; h: string; p: string[] }[] = [
  {
    id: "overview",
    h: "Overview",
    p: [
      "This Privacy Policy explains how Novalss Technology Solutions (“Skula”, “we”, “us”) collects, uses, shares and protects personal data when a school uses the Skula platform. It applies to school administrators, staff, students and parents/guardians whose data is processed through Skula.",
      "We take the privacy of children’s and families’ data seriously and only process it to provide the school management service.",
    ],
  },
  {
    id: "roles",
    h: "Who controls the data",
    p: [
      "Each school is the data controller of the student, staff and parent records it enters into Skula — it decides what data to collect and why. Skula acts as the data processor, handling that data on the school’s behalf and under its instructions.",
      "For the school’s own account information and our website, Skula is the controller.",
    ],
  },
  {
    id: "what-we-collect",
    h: "What we collect",
    p: [
      "Account data: school name, administrator name, email, phone and login credentials.",
      "School records you enter: student, staff and parent details (e.g. names, contact details, dates of birth, guardian information), attendance, fees, exam results, payroll and related academic data.",
      "Payment data: handled by third-party payment processors — we do not store full card details.",
      "Technical data: IP address, device/browser type and basic usage logs, used to keep the service secure and working.",
    ],
  },
  {
    id: "how-we-use",
    h: "How we use data",
    p: [
      "To provide and operate the platform, authenticate users, and deliver the features each school enables.",
      "To send service messages (e.g. fee receipts, notices) on the school’s instruction, and to provide support.",
      "To secure the service, prevent abuse, back up data, and meet legal obligations.",
      "We do not sell personal data, and we do not use student data for advertising.",
    ],
  },
  {
    id: "sharing",
    h: "Sharing & third parties",
    p: [
      "We share data only with service providers who help us run Skula — for example cloud hosting/database infrastructure, SMS/WhatsApp/email delivery, and payment processing. These providers process data under agreements that require appropriate safeguards.",
      "We may disclose data if required by law or to protect rights and safety. We never sell your data.",
    ],
  },
  {
    id: "security",
    h: "Security",
    p: [
      "Data is encrypted in transit, access is restricted, and each school’s data is isolated. We take regular backups. No system is perfectly secure, but we work to protect your data using industry-standard measures.",
    ],
  },
  {
    id: "retention",
    h: "Data retention",
    p: [
      "We keep school data for as long as the account is active. If a school closes its account, we delete or anonymise its data within a reasonable period, except where we must retain certain records to meet legal obligations. Schools can request export or deletion at any time.",
    ],
  },
  {
    id: "children",
    h: "Children’s data",
    p: [
      "Skula is used by schools to manage records that include minors. This data is provided by the school, not collected directly from children. Schools are responsible for obtaining any consent required from parents or guardians under applicable law. Parents/guardians can ask their school to review, correct or remove a child’s data.",
    ],
  },
  {
    id: "your-rights",
    h: "Your rights",
    p: [
      "Subject to applicable law, individuals may request access to, correction of, or deletion of their personal data, and may object to or restrict certain processing. Because schools control their records, such requests are usually made to the school; we assist schools in fulfilling them. School account holders can contact us directly.",
    ],
  },
  {
    id: "cookies",
    h: "Cookies",
    p: [
      "We use essential cookies to keep you signed in and to remember basic preferences. We do not use third-party advertising or cross-site tracking cookies.",
    ],
  },
  {
    id: "transfers",
    h: "International data hosting",
    p: [
      "Our hosting and service providers may store or process data in data centres located outside Ghana. Where this happens, we take steps to ensure your data remains protected to a comparable standard.",
    ],
  },
  {
    id: "changes",
    h: "Changes & governing law",
    p: [
      "We may update this Policy from time to time; the current version is always available here with the “last updated” date above. This Policy is governed by the laws of the Republic of Ghana, including the Data Protection Act, 2012 (Act 843).",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <SkulaNav />

      {/* Header band */}
      <header className="border-b border-slate-100 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-5xl mx-auto px-6 pt-28 pb-12">
          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.16em] mb-3">Legal</p>
          <h1 className="text-[34px] sm:text-[44px] font-black tracking-tight text-slate-900 font-[family-name:var(--font-montserrat)]">
            Privacy Policy
          </h1>
          <p className="text-slate-500 text-[14px] mt-4">
            Last updated {LAST_UPDATED} · Novalss Technology Solutions
          </p>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-6 py-12 lg:grid lg:grid-cols-[210px_1fr] lg:gap-14">
        {/* Table of contents */}
        <nav aria-label="On this page" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3">On this page</p>
            <ul className="space-y-2 border-l border-slate-100">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a href={`#${s.id}`}
                    className="block -ml-px border-l border-transparent hover:border-indigo-400 pl-3 text-[13px] text-slate-500 hover:text-indigo-600 transition-colors">
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
              <h2 className="text-[19px] font-bold text-slate-900 mb-3">
                <span className="text-slate-300 font-semibold mr-2">{i + 1}.</span>{s.h}
              </h2>
              {s.p.map((para, j) => (
                <p key={j} className="text-[15px] text-slate-600 leading-[1.7] mb-3">{para}</p>
              ))}
            </section>
          ))}

          <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50 p-6">
            <h3 className="text-[15px] font-bold text-slate-900">Privacy questions or requests?</h3>
            <p className="text-[14px] text-slate-500 mt-1.5 mb-4">Contact us about accessing, correcting or deleting data.</p>
            <Link href="/contact"
              className="inline-flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-semibold px-5 py-2.5 rounded-lg transition-colors">
              Contact us
            </Link>
          </div>
        </article>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link href="/" className="text-[13px] font-semibold text-indigo-600 hover:underline">← Back to home</Link>
          <div className="flex items-center gap-4 text-[12px] text-slate-400">
            <Link href="/terms" className="hover:text-slate-600">Terms</Link>
            <span>© {new Date().getFullYear()} Novalss Technology Solutions</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
