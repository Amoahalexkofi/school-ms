"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap, ArrowLeft, MessageCircle, Mail, Check,
  Clock, Shield, Users, ArrowRight, PhoneCall,
} from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const CONTACT_EMAIL   = "hello@getskula.com";

const BENEFITS = [
  { icon: Clock,   text: "Live in under 30 minutes — we set it up with you" },
  { icon: Users,   text: "Built for Ghanaian schools — GHS, academic calendars, BECE prep" },
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
    <div className="min-h-screen bg-slate-50 flex flex-col">

      {/* Top nav */}
      <nav className="bg-white border-b border-slate-100 px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-black text-slate-900 text-[15px] tracking-tight">Skula</span>
        </Link>
        <Link href="/" className="inline-flex items-center gap-1.5 text-[13px] font-medium text-slate-500 hover:text-slate-800 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </nav>

      {/* Main content */}
      <div className="flex-1 flex items-start justify-center px-4 py-12 md:py-16">
        <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start">

          {/* ── Left: Brand panel ── */}
          <div className="space-y-8">

            {/* Headline */}
            <div>
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-semibold px-3 py-1.5 rounded-full mb-4">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" />
                Trusted by schools across Ghana
              </div>
              <h1 className="text-[32px] font-black text-slate-900 leading-tight tracking-tight">
                Get your school running<br />
                <span className="text-indigo-600">on Skula today.</span>
              </h1>
              <p className="text-[15px] text-slate-500 mt-3 leading-relaxed">
                We'll set everything up together — classes, students, fees, timetables.
                Most schools are live the same day.
              </p>
            </div>

            {/* Benefits */}
            <div className="space-y-3">
              {BENEFITS.map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0 mt-0.5">
                    <Icon className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-[14px] text-slate-600 leading-snug pt-1.5">{text}</p>
                </div>
              ))}
            </div>

            {/* What happens next */}
            <div className="bg-white rounded-xl border border-slate-200 p-5">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-wider mb-4">What happens next</p>
              <div className="space-y-4">
                {STEPS.map(({ n, label, sub }) => (
                  <div key={n} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center shrink-0 text-white text-[11px] font-bold mt-0.5">{n}</div>
                    <div>
                      <p className="text-[13px] font-semibold text-slate-800">{label}</p>
                      <p className="text-[12px] text-slate-400 mt-0.5">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Direct contact */}
            <div className="flex items-center gap-2 text-[13px] text-slate-400">
              <PhoneCall className="h-3.5 w-3.5" />
              <span>Prefer to just call?</span>
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank" rel="noopener noreferrer"
                className="text-indigo-600 font-semibold hover:underline"
              >
                Open WhatsApp directly →
              </a>
            </div>
          </div>

          {/* ── Right: Form card ── */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-[0_2px_16px_rgba(0,0,0,0.06)] p-7">

            {sent ? (
              <div className="text-center py-8">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Check className="h-7 w-7 text-emerald-600" />
                </div>
                <h2 className="text-[20px] font-black text-slate-900 mb-2">Message sent!</h2>
                <p className="text-[14px] text-slate-500 mb-6">
                  We'll get back to you within the hour. Check your WhatsApp.
                </p>
                <button
                  onClick={() => setSent(false)}
                  className="text-[13px] text-indigo-600 font-semibold hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h2 className="text-[20px] font-black text-slate-900">Talk to us</h2>
                  <p className="text-[13px] text-slate-400 mt-1">We reply within the hour on WhatsApp.</p>
                </div>

                <div className="space-y-4">

                  {/* Name */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      Your name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={set("name")}
                      placeholder="e.g. Kofi Mensah"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                    {touched && !form.name.trim() && (
                      <p className="text-[12px] text-red-500 mt-1">Name is required</p>
                    )}
                  </div>

                  {/* School */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      School name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      value={form.school}
                      onChange={set("school")}
                      placeholder="e.g. Lincoln International School"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                    {touched && !form.school.trim() && (
                      <p className="text-[12px] text-red-500 mt-1">School name is required</p>
                    )}
                  </div>

                  {/* Role */}
                  <div>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Your role</label>
                    <select
                      value={form.role}
                      onChange={set("role")}
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors appearance-none"
                      style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center", paddingRight: "36px" }}
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
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
                      WhatsApp number
                      <span className="text-slate-400 font-normal ml-1">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={set("phone")}
                      placeholder="+233 XX XXX XXXX"
                      className="w-full h-10 rounded-lg border border-slate-200 bg-white px-3 text-[14px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-colors"
                    />
                  </div>
                </div>

                {/* CTA buttons */}
                <div className="mt-6 space-y-2.5">
                  <button
                    onClick={handleWhatsApp}
                    className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5d] text-white font-bold h-11 rounded-xl transition-colors text-[14px] shadow-[0_2px_8px_rgba(37,211,102,0.35)]"
                  >
                    <MessageCircle className="h-[18px] w-[18px]" />
                    Chat on WhatsApp
                  </button>
                  <button
                    onClick={handleEmail}
                    className="w-full inline-flex items-center justify-center gap-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold h-11 rounded-xl transition-colors text-[14px]"
                  >
                    <Mail className="h-4 w-4 text-slate-400" />
                    Send via email
                  </button>
                </div>

                {/* Demo link */}
                <p className="text-center text-[12px] text-slate-400 mt-5">
                  Not ready yet?{" "}
                  <Link href="/demo" className="text-indigo-600 font-semibold hover:underline">
                    Try the live demo →
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
