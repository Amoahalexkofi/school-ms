import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Users, ClipboardList, BookOpen, DollarSign, UserCog, Library,
  Bus, Package, Monitor, BarChart2, MessageCircle, Building2,
  CheckCircle2, ArrowRight, GraduationCap, Globe, Shield, Zap,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <div className="min-h-screen bg-white font-[family-name:var(--font-plus-jakarta-sans)]">

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">Novalss</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-gray-900 transition-colors">Features</a>
            <a href="#pricing"  className="hover:text-gray-900 transition-colors">Pricing</a>
            <a href="#faq"      className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors">
              Sign in
            </Link>
            <Link href="/register" className="inline-flex items-center gap-1.5 text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors">
              Get started <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-50 via-white to-purple-50 pt-20 pb-28">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative max-w-6xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
            <Zap className="h-3.5 w-3.5" /> Built for modern schools
          </div>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight max-w-3xl mx-auto">
            Run your school<br />
            <span className="text-indigo-600">smarter, not harder</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Novalss is a complete school management platform — students, fees, exams, attendance,
            staff, and more. Every school gets its own subdomain in minutes.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
              Start free trial <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/sign-in" className="inline-flex items-center gap-2 bg-white text-gray-700 px-6 py-3.5 rounded-xl font-semibold border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors">
              Sign in to your school
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">No credit card required · 14-day free trial</p>
        </div>

        {/* Dashboard mockup */}
        <div className="relative max-w-5xl mx-auto mt-16 px-6">
          <div className="rounded-2xl border border-gray-200 shadow-2xl shadow-indigo-100/50 bg-white overflow-hidden">
            <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 mx-3 h-6 bg-white rounded-md border border-gray-200 flex items-center px-3">
                <span className="text-xs text-gray-400 font-mono">yourschool.novalss.com/dashboard</span>
              </div>
            </div>
            <div className="p-6 bg-gray-50">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Total Students", value: "842",    color: "bg-blue-50 text-blue-700 border-blue-100" },
                  { label: "Staff Members",  value: "64",     color: "bg-green-50 text-green-700 border-green-100" },
                  { label: "Fees Collected", value: "₵48,200",color: "bg-purple-50 text-purple-700 border-purple-100" },
                  { label: "Present Today",  value: "96%",    color: "bg-amber-50 text-amber-700 border-amber-100" },
                ].map(c => (
                  <div key={c.label} className={`rounded-xl border p-3 ${c.color}`}>
                    <p className="text-xs opacity-70">{c.label}</p>
                    <p className="text-xl font-bold mt-1">{c.value}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {["Students", "Attendance", "Fees", "Exams", "Staff", "Reports"].map(m => (
                  <div key={m} className="bg-white rounded-xl border border-gray-200 p-3 text-xs font-medium text-gray-600">{m}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Everything a school needs</h2>
          <p className="mt-3 text-gray-500 max-w-xl mx-auto">All 20+ modules in one platform. No add-ons, no per-module pricing.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: Users,         color: "bg-blue-50 text-blue-600",    title: "Students & Enrollment",  desc: "Admission, profiles, session enrollment, ID cards, promotions and full academic history." },
            { icon: ClipboardList, color: "bg-green-50 text-green-600",  title: "Attendance",             desc: "Daily student and staff attendance with bulk marking, reports, and percentage tracking." },
            { icon: BookOpen,      color: "bg-purple-50 text-purple-600",title: "Exams & Marks",          desc: "Exam groups, mark entry, auto-grading, admit cards, marksheets and ranked results." },
            { icon: DollarSign,    color: "bg-amber-50 text-amber-600",  title: "Fee Management",         desc: "Fee types, groups, discounts, collection, invoices, carry-forward and printed receipts." },
            { icon: UserCog,       color: "bg-rose-50 text-rose-600",    title: "Staff & Payroll",        desc: "Staff profiles, departments, designations, payslips, bulk payroll and leave management." },
            { icon: Monitor,       color: "bg-cyan-50 text-cyan-600",    title: "Online Exams",           desc: "Create timed online exams with question banks, auto-grading and instant results." },
            { icon: Library,       color: "bg-teal-50 text-teal-600",    title: "Library",                desc: "Book catalog, issue tracking, overdue alerts, fine calculation and member management." },
            { icon: Bus,           color: "bg-orange-50 text-orange-600",title: "Transport",              desc: "Routes, vehicles, pickup points, student assignment and transport fee integration." },
            { icon: Package,       color: "bg-lime-50 text-lime-600",    title: "Inventory",              desc: "Items, stock in/out, supplier tracking, low-stock alerts and staff issue log." },
            { icon: BarChart2,     color: "bg-indigo-50 text-indigo-600",title: "Reports",                desc: "Student, attendance, fees, exams and library reports with CSV export and print." },
            { icon: MessageCircle, color: "bg-pink-50 text-pink-600",    title: "Communication",          desc: "Internal chat, notice board, bulk messaging, homework and push notifications." },
            { icon: Building2,     color: "bg-violet-50 text-violet-600",title: "Front Office",           desc: "Visitor log, complaints, enquiries, dispatch log and full admissions workflow." },
          ].map(({ icon: Icon, color, title, desc }) => (
            <div key={title} className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 hover:shadow-md transition-all">
              <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Why Novalss */}
      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-white">One platform. Your own subdomain.</h2>
              <p className="mt-4 text-indigo-100 text-lg leading-relaxed">
                Every school gets a dedicated URL like <span className="font-semibold text-white">yourschool.novalss.com</span>.
                Fully isolated data, zero setup time.
              </p>
              <ul className="mt-8 space-y-3">
                {[
                  "School live in under 2 minutes",
                  "All data isolated per school — fully multi-tenant",
                  "Admin, teacher, accountant, librarian and student roles",
                  "Works on any device — fully mobile responsive",
                ].map(item => (
                  <li key={item} className="flex items-center gap-3 text-indigo-100">
                    <CheckCircle2 className="h-5 w-5 text-indigo-300 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Globe,    label: "Multi-tenant SaaS", sub: "Each school isolated" },
                { icon: Shield,   label: "Role-based access",  sub: "7 permission levels" },
                { icon: Zap,      label: "Fast setup",         sub: "Live in 2 minutes" },
                { icon: BarChart2,label: "Rich reporting",     sub: "Export to CSV & PDF" },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="bg-white/10 backdrop-blur rounded-2xl p-5 text-white">
                  <Icon className="h-6 w-6 text-indigo-200 mb-3" />
                  <p className="font-semibold">{label}</p>
                  <p className="text-xs text-indigo-200 mt-1">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-gray-900">Simple, transparent pricing</h2>
          <p className="mt-3 text-gray-500">Start free. Upgrade when you grow.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              name: "Starter",
              price: "Free",
              period: "14-day trial",
              desc: "Perfect for trying out Novalss",
              features: ["Up to 100 students", "5 staff accounts", "All core modules", "Email support"],
              cta: "Start free trial",
              highlight: false,
            },
            {
              name: "Growth",
              price: "$29",
              period: "/ month",
              desc: "For growing schools",
              features: ["Up to 500 students", "Unlimited staff", "All modules + reports", "Priority support", "CSV & PDF exports"],
              cta: "Get started",
              highlight: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              period: "",
              desc: "For large schools & districts",
              features: ["Unlimited students", "Multi-school management", "Custom branding", "Dedicated support", "SLA guarantee"],
              cta: "Contact us",
              highlight: false,
            },
          ].map(plan => (
            <div
              key={plan.name}
              className={`rounded-2xl border p-7 flex flex-col ${
                plan.highlight
                  ? "border-indigo-500 bg-indigo-600 text-white shadow-xl shadow-indigo-200"
                  : "border-gray-200 bg-white"
              }`}
            >
              <p className={`text-sm font-semibold ${plan.highlight ? "text-indigo-200" : "text-gray-500"}`}>{plan.name}</p>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold">{plan.price}</span>
                <span className={`text-sm ${plan.highlight ? "text-indigo-200" : "text-gray-400"}`}>{plan.period}</span>
              </div>
              <p className={`mt-1 text-sm ${plan.highlight ? "text-indigo-100" : "text-gray-500"}`}>{plan.desc}</p>
              <ul className="mt-6 space-y-2.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${plan.highlight ? "text-indigo-300" : "text-green-500"}`} />
                    <span className={plan.highlight ? "text-indigo-50" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href="/register"
                className={`mt-8 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlight
                    ? "bg-white text-indigo-600 hover:bg-indigo-50"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {plan.cta} <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-gray-50 py-24">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900">Frequently asked questions</h2>
          </div>
          <div className="space-y-4">
            {[
              {
                q: "How quickly can my school get started?",
                a: "Under 2 minutes. Fill in your school name and admin credentials on the registration page and your school is live at yourschool.novalss.com immediately.",
              },
              {
                q: "Is our data safe and isolated from other schools?",
                a: "Yes. Every school runs in its own isolated database schema. There is zero data sharing between schools on the platform.",
              },
              {
                q: "Can multiple staff roles use the system?",
                a: "Yes. Novalss has 7 built-in roles: Super Admin, Admin, Teacher, Accountant, Librarian, Student and Parent — each with appropriate access.",
              },
              {
                q: "Does it work on mobile phones?",
                a: "Yes. The entire platform is mobile-responsive and works on any modern browser.",
              },
              {
                q: "Can I export or print reports?",
                a: "Yes. All reports support CSV export and print-friendly layouts. Fee receipts, ID cards, admit cards and marksheets are all printable.",
              },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-2xl border border-gray-200 p-6">
                <p className="font-semibold text-gray-900 mb-2">{q}</p>
                <p className="text-sm text-gray-600 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 max-w-4xl mx-auto px-6 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900">Ready to modernise your school?</h2>
        <p className="mt-4 text-lg text-gray-500">Set up in minutes. No credit card required.</p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/register" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
            Get started free <ArrowRight className="h-5 w-5" />
          </Link>
          <Link href="/sign-in" className="inline-flex items-center gap-2 text-gray-600 border border-gray-200 px-8 py-4 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Sign in
          </Link>
        </div>
        <p className="mt-4 text-sm text-gray-400">No credit card required · Cancel anytime</p>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">Novalss</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-400">
            <a href="#features" className="hover:text-gray-600">Features</a>
            <a href="#pricing"  className="hover:text-gray-600">Pricing</a>
            <a href="#faq"      className="hover:text-gray-600">FAQ</a>
            <Link href="/sign-in" className="hover:text-gray-600">Sign in</Link>
          </div>
          <p className="text-xs text-gray-400">© {new Date().getFullYear()} Novalss. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
