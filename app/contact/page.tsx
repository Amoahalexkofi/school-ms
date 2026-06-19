"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, ArrowLeft, MessageCircle, Mail, Check,
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
    <div className="min-h-screen flex">

      {/* ── Left panel — hero gradient ── */}
      <div className="hidden lg:flex lg:w-[48%] relative flex-col overflow-hidden"
        style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}>

        {/* Blobs */}
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.13) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.1) 1px, transparent 0)", backgroundSize: "32px 32px" }} />

        <div className="relative flex flex-col h-full px-12 py-12 max-w-[600px]">

          {/* Logo */}
          <div className="flex items-center gap-4 shrink-0">
            <Link href="/" className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-300/40">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-slate-900 font-black text-[28px] tracking-tight leading-none">Skula</span>
                <p className="text-indigo-500 text-[10.5px] font-bold tracking-widest uppercase mt-0.5">by Novalss</p>
              </div>
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col justify-center">

            <div className="inline-flex items-center gap-2 bg-white/65 border border-white/80 text-indigo-700 text-[11px] font-bold px-3.5 py-1.5 rounded-full mb-7 w-fit backdrop-blur-sm shadow-sm">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-pulse" />
              Trusted by schools worldwide
            </div>

            <h1 className="font-black text-slate-900 leading-[1.06] tracking-tight mb-5" style={{ fontSize: "clamp(36px, 3.2vw, 48px)" }}>
              Get your school<br />running on{" "}
              <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                Skula today.
              </span>
            </h1>

            <p className="text-slate-600 text-[15.5px] leading-relaxed mb-10 max-w-[420px]">
              We'll set everything up together — classes, students, fees, timetables. Most schools are live the same day.
            </p>

            {/* Benefits */}
            <ul className="space-y-4 mb-10">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-4 text-[14.5px] font-medium text-slate-700">
                  <div className="w-9 h-9 rounded-xl bg-white/70 border border-white/90 flex items-center justify-center shrink-0 backdrop-blur-sm shadow-sm">
                    <Icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  {text}
                </li>
              ))}
            </ul>

            {/* Steps */}
            <div className="bg-white/55 border border-white/80 rounded-2xl p-6 backdrop-blur-sm max-w-[460px]">
              <p className="text-[10.5px] font-black text-slate-400 uppercase tracking-[0.15em] mb-5">What happens next</p>
              <div className="space-y-5">
                {STEPS.map(({ n, label, sub }, i) => (
                  <div key={n} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0 text-white text-[12px] font-black shadow-md shadow-indigo-300/30">{n}</div>
                    <div className="flex-1 pt-0.5">
                      <p className="text-[14px] font-bold text-slate-800">{label}</p>
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

      {/* ── Right panel — form side ── */}
      <div className="flex-1 flex flex-col relative"
        style={{ background: "linear-gradient(160deg, #f8fafc 0%, #f1f5f9 60%, #f8fafc 100%)" }}>

        {/* Subtle dot grid */}
        <div className="absolute inset-0 pointer-events-none opacity-30"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, #cbd5e1 1px, transparent 0)", backgroundSize: "20px 20px" }} />

        {/* Left accent border */}
        <div className="absolute left-0 top-0 bottom-0 w-[2px]"
          style={{ background: "linear-gradient(180deg, transparent 5%, #6366f1 35%, #8b5cf6 65%, transparent 95%)" }} />

        {/* Back link */}
        <div className="relative shrink-0 flex justify-end px-4 pt-5 sm:px-8 sm:pt-6">
          <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>
        </div>

        {/* Mobile logo */}
        <div className="relative lg:hidden flex items-center gap-3 px-4 pt-4 pb-0 sm:px-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-gray-900 text-xl">Skula</span>
        </div>

        <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-6 sm:px-10 sm:py-8">
          <div className="w-full max-w-[520px] bg-white rounded-3xl border border-slate-200/80 px-5 py-8 sm:px-10 sm:py-10"
            style={{ boxShadow: "0 2px 4px rgba(0,0,0,0.04), 0 8px 28px rgba(99,102,241,0.10), 0 32px 64px rgba(0,0,0,0.07)" }}>

            {sent ? (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <h2 className="text-[24px] font-black text-slate-900 mb-2">Message sent!</h2>
                <p className="text-[14px] text-slate-500 mb-6">We'll get back to you within the hour. Check your WhatsApp.</p>
                <button onClick={() => setSent(false)} className="text-[13px] text-indigo-600 font-bold hover:underline">
                  Send another message
                </button>
              </div>
            ) : (
              <>
                {/* Header */}
                <div className="flex w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 items-center justify-center mb-7 shadow-lg shadow-indigo-300/40">
                  <GraduationCap className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-[28px] font-black text-slate-900 tracking-tight leading-tight">Talk to us</h2>
                <p className="text-slate-400 text-[14px] mt-1.5 mb-7">We reply within the hour on WhatsApp.</p>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                      Your name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" value={form.name} onChange={set("name")}
                      placeholder="e.g. Kofi Mensah"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                    />
                    {touched && !form.name.trim() && <p className="text-[12px] text-red-500 mt-1">Name is required</p>}
                  </div>

                  {/* School */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                      School name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text" value={form.school} onChange={set("school")}
                      placeholder="e.g. Lincoln International School"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                    />
                    {touched && !form.school.trim() && <p className="text-[12px] text-red-500 mt-1">School name is required</p>}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">Your role</label>
                    <select
                      value={form.role} onChange={set("role")}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all appearance-none"
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
                    <label className="block text-[13px] font-bold text-slate-700 mb-1.5">
                      WhatsApp number <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel" value={form.phone} onChange={set("phone")}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                {/* CTAs */}
                <div className="mt-7 space-y-3">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold h-12 rounded-2xl transition-colors text-[15px] shadow-lg shadow-emerald-300/40"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Chat on WhatsApp
                  </button>
                  <button
                    onClick={handleEmail}
                    className="w-full inline-flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-semibold h-12 rounded-2xl transition-colors text-[14px]"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    Send via email
                  </button>
                </div>

                <p className="text-center text-[12px] text-slate-400 mt-5">
                  Not ready yet?{" "}
                  <Link href="/demo" className="text-indigo-600 font-bold hover:underline">Try the live demo →</Link>
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
