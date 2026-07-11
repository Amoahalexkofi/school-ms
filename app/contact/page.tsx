"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, MessageCircle, Mail, Check,
  Clock, Shield, Users, ChevronRight,
} from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const CONTACT_EMAIL   = "hello@getskula.com";

const BENEFITS = [
  { icon: Clock,   text: "Live in under 30 minutes — we set it up with you" },
  { icon: Users,   text: "Built for modern schools — flexible calendars, grading scales, multi-currency" },
  { icon: Shield,  text: "Your data stays yours. Hosted securely, backed up daily" },
  { icon: Check,   text: "Free trial. No card required. Cancel anytime" },
];

const STEPS = [
  { n: "1", label: "Send your message", sub: "We reply within the hour on WhatsApp" },
  { n: "2", label: "30-min onboarding call", sub: "We walk you through setup together" },
  { n: "3", label: "Your school goes live", sub: "Students, staff, fees — all running" },
];

export default function ContactPage() {
  const [form, setForm]       = useState({ name: "", school: "", phone: "", role: "" });
  const [touched, setTouched] = useState(false);
  const [sent, setSent]       = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const valid = form.name.trim() && form.school.trim();

  function handleWhatsApp() {
    setTouched(true);
    if (!valid) return;
    const role = form.role ? ` (${form.role})` : "";
    const text = encodeURIComponent(
      `Hi Skula! I'm ${form.name.trim()}${role} from ${form.school.trim()}. I'd like to set up Skula for my school.${form.phone ? ` My number: ${form.phone}` : ""}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
    setSent(true);
  }

  function handleEmail() {
    setTouched(true);
    if (!valid) return;
    const role = form.role ? ` (${form.role})` : "";
    const subject = encodeURIComponent(`Skula enquiry — ${form.school.trim()}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm ${form.name.trim()}${role} from ${form.school.trim()} and I'd like to learn more about Skula.${form.phone ? `\n\nMy WhatsApp: ${form.phone}` : ""}\n\nThanks`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
    setSent(true);
  }

  return (
    <div className="min-h-screen flex"
      style={{ fontFamily: "sohne-var, 'SF Pro Display', system-ui, -apple-system, sans-serif", fontFeatureSettings: '"ss01"' }}>

      {/* ── Left panel — hero gradient ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col overflow-hidden"
        style={{
          background: [
            "radial-gradient(110% 70% at 90% 0%, rgba(83,58,253,0.30) 0%, transparent 55%)",
            "radial-gradient(70% 55% at 100% 55%, rgba(234,34,97,0.14) 0%, transparent 55%)",
            "radial-gradient(85% 70% at 15% 0%, rgba(245,233,212,0.9) 0%, transparent 65%)",
            "radial-gradient(90% 80% at 0% 45%, rgba(185,185,249,0.45) 0%, transparent 60%)",
            "linear-gradient(180deg, #f6f9fc 0%, #ffffff 100%)",
          ].join(", "),
        }}>

        <div className="relative flex flex-col h-full px-12 py-10 max-w-[600px]">

          {/* Logo */}
          <div className="shrink-0">
            <Link href="/">
              <img src="/images/skula-logomark.png" alt="Skula" className="h-11 object-contain" />
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto">
            <div className="flex flex-col justify-center min-h-full">

            <div className="inline-flex items-center gap-2 bg-white/80 border border-[#e3e8ee] text-[#4434d4] text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-6 w-fit backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 bg-[#533afd] rounded-full animate-pulse" />
              Built for African schools
            </div>

            <h1 className="font-light text-[#0d253d] leading-[1.05] tracking-[-0.02em] mb-4" style={{ fontSize: "clamp(34px, 3vw, 44px)" }}>
              Get your school<br />running on{" "}
              <span className="text-[#533afd]">Skula today.</span>
            </h1>

            <p className="text-[#273951] text-[15px] leading-relaxed mb-7 max-w-[420px]">
              We'll set everything up together — classes, students, fees, timetables. Most schools are live the same day.
            </p>

            {/* Benefits */}
            <ul className="space-y-3.5 mb-8">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4 text-[14.5px] font-medium text-[#273951]">
                  <div className="w-8 h-8 rounded-xl bg-white/80 border border-[#e3e8ee] flex items-center justify-center shrink-0 backdrop-blur-sm shadow-sm">
                    <Icon className="h-4 w-4 text-[#533afd]" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            {/* Steps */}
            <div className="bg-white/80 border border-[#e3e8ee] rounded-2xl p-5 backdrop-blur-sm max-w-[460px]">
              <p className="text-[10.5px] font-semibold text-[#64748d] uppercase tracking-[0.15em] mb-4">What happens next</p>
              <div className="space-y-4">
                {STEPS.map(({ n, label, sub }, i) => (
                  <div key={n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-[#533afd] flex items-center justify-center shrink-0 text-white text-[12px] font-semibold">{n}</div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] font-semibold text-[#0d253d]">{label}</p>
                      <p className="text-[12.5px] text-slate-500 mt-0.5">{sub}</p>
                    </div>
                    {i < STEPS.length - 1 && <ChevronRight className="h-4 w-4 text-slate-300 shrink-0 mt-1.5" />}
                  </div>
                ))}
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right panel — form side ── */}
      <div className="flex-1 flex flex-col relative" style={{ background: "#f6f9fc" }}>

        {/* Back link */}
        <div className="relative shrink-0 flex justify-end px-4 pt-5 sm:px-8 sm:pt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="relative lg:hidden px-4 pt-4 pb-0 sm:px-8">
          <img src="/images/skula-logomark.png" alt="Skula" className="h-9 object-contain" />
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 sm:px-10 sm:py-8">
          <div className="w-full max-w-[520px] bg-white rounded-3xl border border-[#e3e8ee] px-5 py-8 sm:px-10 sm:py-10"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-[24px] font-light text-[#0d253d] mb-2">Message sent!</h2>
                <p className="text-[14px] text-slate-500 mb-6">We'll get back to you within the hour. Check your WhatsApp.</p>
                <button onClick={() => setSent(false)} className="text-[13px] text-[#533afd] font-semibold hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <img src="/images/skula-logomark.png" alt="Skula" className="h-10 object-contain mb-6" />
                <h2 className="text-[28px] font-light text-[#0d253d] tracking-[-0.01em] leading-tight">Talk to us</h2>
                <p className="text-[#64748d] text-[14px] mt-1.5 mb-7">We reply within the hour on WhatsApp.</p>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="contact-name" className="block text-[13px] font-medium text-[#273951] mb-1.5">
                      Your name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-name"
                      type="text" value={form.name} onChange={set("name")}
                      placeholder="e.g. Kofi Mensah"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 focus:border-[#a8c3de] focus:bg-white transition-all"
                    />
                    {touched && !form.name.trim() && <p className="text-[12px] text-red-500 mt-1">Name is required</p>}
                  </div>

                  {/* School */}
                  <div>
                    <label htmlFor="contact-school" className="block text-[13px] font-medium text-[#273951] mb-1.5">
                      School name <span className="text-red-400">*</span>
                    </label>
                    <input
                      id="contact-school"
                      type="text" value={form.school} onChange={set("school")}
                      placeholder="e.g. Lincoln International School"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 focus:border-[#a8c3de] focus:bg-white transition-all"
                    />
                    {touched && !form.school.trim() && <p className="text-[12px] text-red-500 mt-1">School name is required</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label htmlFor="contact-role" className="block text-[13px] font-medium text-[#273951] mb-1.5">Your role</label>
                    <select
                      id="contact-role"
                      value={form.role} onChange={set("role")}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 focus:border-[#a8c3de] focus:bg-white transition-all appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center", paddingRight: "40px" }}
                    >
                      <option value="">— Select your role —</option>
                      <option>Headmaster / Principal</option>
                      <option>School Owner / Director</option>
                      <option>Administrator</option>
                      <option>IT / Tech Manager</option>
                      <option>Other</option>
                    </select>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="contact-phone" className="block text-[13px] font-medium text-[#273951] mb-1.5">
                      WhatsApp number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      id="contact-phone"
                      type="tel" value={form.phone} onChange={set("phone")}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#533afd]/20 focus:border-[#a8c3de] focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-7 space-y-3">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-medium h-12 rounded-full transition-colors text-[15px]"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </button>
                  <button
                    onClick={handleEmail}
                    className="w-full inline-flex items-center justify-center gap-2.5 border border-[#e3e8ee] bg-white hover:bg-[#f6f9fc] text-[#273951] font-medium h-12 rounded-full transition-colors text-[14px]"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    Send via email
                  </button>
                </div>

                <p className="text-center text-[12px] text-slate-400 mt-5">
                  Not ready yet?{" "}
                  <Link href="/demo" className="text-[#533afd] font-semibold hover:underline">Try the live demo →</Link>
                </p>
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="relative shrink-0 px-4 pb-6 text-center sm:px-8">
          <p className="text-[11px] text-gray-400">
            Powered by <span className="font-semibold text-gray-500">Skula</span>{" "}·{" "}
            <a href="https://novalss.com" className="hover:underline">a Novalss product</a>
          </p>
        </div>
      </div>
    </div>
  );
}
