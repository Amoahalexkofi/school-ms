"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, ArrowLeft, MessageCircle, Mail } from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const CONTACT_EMAIL   = "hello@getskula.com";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", school: "", phone: "" });
  const [touched, setTouched] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const valid = form.name.trim() && form.school.trim();

  function handleWhatsApp() {
    setTouched(true);
    if (!valid) return;
    const text = encodeURIComponent(
      `Hi! I'm ${form.name.trim()} from ${form.school.trim()}. I'd like to learn more about Skula.${form.phone ? ` My number: ${form.phone}` : ""}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  }

  function handleEmail() {
    setTouched(true);
    if (!valid) return;
    const subject = encodeURIComponent(`Skula enquiry — ${form.school.trim()}`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm ${form.name.trim()} from ${form.school.trim()} and I'd like to learn more about Skula.${form.phone ? `\n\nMy WhatsApp: ${form.phone}` : ""}\n\nThanks`
    );
    window.open(`mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`, "_blank");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex flex-col">

      {/* Nav */}
      <nav className="px-6 h-16 flex items-center border-b border-white/5">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <GraduationCap className="h-4.5 w-4.5 h-[18px] w-[18px] text-white" />
          </div>
          <span className="font-black text-white text-base tracking-tight">Skula</span>
        </Link>
      </nav>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">

          <Link href="/" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm mb-8 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to home
          </Link>

          <h1 className="text-3xl font-black text-white mb-2">Get in touch</h1>
          <p className="text-slate-400 mb-8">
            Tell us about your school and we'll get back to you within the hour.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Your name *</label>
              <input
                type="text"
                value={form.name}
                onChange={set("name")}
                placeholder="e.g. Kofi Mensah"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {touched && !form.name.trim() && <p className="text-red-400 text-xs mt-1">Name is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">School name *</label>
              <input
                type="text"
                value={form.school}
                onChange={set("school")}
                placeholder="e.g. Lincoln International School"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              {touched && !form.school.trim() && <p className="text-red-400 text-xs mt-1">School name is required</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                WhatsApp number <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={set("phone")}
                placeholder="+233 XX XXX XXXX"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Submit buttons */}
          <div className="flex gap-3 mt-7">
            <button
              onClick={handleWhatsApp}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold px-5 py-3.5 rounded-xl hover:bg-[#20bd5a] transition-colors text-sm"
            >
              <MessageCircle className="h-4 w-4" />
              Chat on WhatsApp
            </button>
            <button
              onClick={handleEmail}
              className="flex-1 inline-flex items-center justify-center gap-2 border border-white/10 text-slate-300 font-semibold px-5 py-3.5 rounded-xl hover:bg-white/5 transition-colors text-sm"
            >
              <Mail className="h-4 w-4" />
              Send email
            </button>
          </div>

          <p className="text-center text-slate-600 text-xs mt-6">
            Or{" "}
            <Link href="/demo" className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2">
              try the live demo
            </Link>{" "}
            first — no account needed.
          </p>
        </div>
      </div>
    </div>
  );
}
