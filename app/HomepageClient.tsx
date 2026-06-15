"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
  TrendingUp, Shield, Clock, Smartphone, Bell, FileText,
  Bus, Library, ChevronRight, Star, Menu, X, Zap, Globe,
  Lock, Check, Minus,
} from "lucide-react";

const WHATSAPP_NUMBER = "233595111461";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hi! I'd like to learn more about Skula for my school.")}`;

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" as const } },
};
const stagger = { show: { transition: { staggerChildren: 0.1 } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.5, ease: "easeOut" as const } } };

/* ─── SKULA DASHBOARD MOCKUP ─── */
function DashboardMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-indigo-200/30 bg-white">
      {/* Browser bar */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100/80 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">
          app.getskula.com/dashboard
        </div>
      </div>
      {/* App shell */}
      <div className="flex h-[340px]">
        {/* Sidebar */}
        <div className="w-[140px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[
            { icon: BarChart2, label: "Dashboard", active: true },
            { icon: Users,     label: "Students",  active: false },
            { icon: DollarSign,label: "Fees",       active: false },
            { icon: ClipboardList, label: "Attendance", active: false },
            { icon: BookOpen,  label: "Exams",      active: false },
            { icon: FileText,  label: "Reports",    active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${active ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"}`}>
              <Icon className="h-3 w-3 shrink-0" />
              {label}
            </div>
          ))}
        </div>
        {/* Main content */}
        <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[11px] font-black text-slate-900">GoldCoast Academy</p>
              <p className="text-[9px] text-slate-400">Academic Year 2025/2026</p>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bell className="h-3 w-3 text-white" />
              </div>
              <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center">
                <span className="text-[8px] font-black text-slate-600">AA</span>
              </div>
            </div>
          </div>
          {/* Stat cards */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Students", val: "1,247", trend: "+12", icon: Users, bg: "bg-indigo-500", light: "bg-indigo-50" },
              { label: "Fees (GHS)", val: "84.5K", trend: "+8%", icon: DollarSign, bg: "bg-emerald-500", light: "bg-emerald-50" },
              { label: "Attendance", val: "94%", trend: "+2%", icon: ClipboardList, bg: "bg-amber-500", light: "bg-amber-50" },
              { label: "Staff", val: "86", trend: "+3", icon: Shield, bg: "bg-violet-500", light: "bg-violet-50" },
            ].map(({ label, val, trend, icon: Icon, bg, light }) => (
              <div key={label} className="bg-white rounded-xl p-2.5 border border-slate-100 shadow-sm">
                <div className={`w-6 h-6 ${light} rounded-lg flex items-center justify-center mb-1.5`}>
                  <Icon className={`h-3 w-3 ${bg.replace("bg-", "text-")}`} />
                </div>
                <p className="text-slate-900 text-[13px] font-black leading-none">{val}</p>
                <p className="text-slate-400 text-[8px] mt-0.5">{label}</p>
                <p className="text-emerald-500 text-[8px] font-bold mt-0.5">{trend}</p>
              </div>
            ))}
          </div>
          {/* Charts row */}
          <div className="grid grid-cols-3 gap-2">
            {/* Attendance chart */}
            <div className="col-span-2 bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 mb-2">Weekly Attendance</p>
              <div className="flex items-end gap-1 h-14">
                {[78, 85, 92, 88, 95, 82, 91].map((h, i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className={`rounded-sm ${i === 4 ? "bg-indigo-600" : "bg-indigo-200"}`} style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M","T","W","T","F","S","S"].map((d, i) => (
                  <span key={i} className="flex-1 text-center text-[7px] text-slate-400">{d}</span>
                ))}
              </div>
            </div>
            {/* Recent payments */}
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 mb-2">Recent Fees</p>
              {[["Kwame A.", "450"], ["Abena M.", "380"], ["Kofi T.", "600"]].map(([n, a]) => (
                <div key={n} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-[8px] text-slate-600">{n}</span>
                  <span className="text-[8px] font-bold text-emerald-600">₵{a}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FLOATING CARDS ─── */
function FloatingCard({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay }}
      className={`absolute bg-white/95 backdrop-blur border border-slate-200/80 rounded-2xl shadow-xl shadow-slate-300/30 p-3.5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

/* ─── FAQ ITEM ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-slate-900 font-semibold text-[15px]">{q}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="px-6 pb-5 text-slate-500 text-[14px] leading-relaxed border-t border-slate-100 pt-4">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── MAIN COMPONENT ─── */
export function HomepageClient() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">

      {/* ── NAVBAR ── */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-white/95 backdrop-blur-md border-b border-slate-200/60 shadow-sm" : "bg-transparent"}`}>
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-sm shadow-indigo-300">
              <GraduationCap className="h-[18px] w-[18px] text-white" />
            </div>
            <span className="font-black text-slate-900 text-[16px] tracking-tight">Skula</span>
          </Link>
          {/* Center links */}
          <div className="hidden md:flex items-center gap-8">
            {[["Features","#features"],["Solutions","#solutions"],["Pricing","#pricing"],["Resources","/features"],["Contact","/contact"]].map(([l,h])=>(
              <a key={l} href={h} className="text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors">{l}</a>
            ))}
          </div>
          {/* Right */}
          <div className="hidden md:flex items-center gap-2.5">
            <Link href="/sign-in" className="text-[13px] font-semibold text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors">
              Login
            </Link>
            <Link href="/contact" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[13px] font-bold px-5 py-2.5 rounded-xl transition-colors shadow-sm shadow-indigo-200">
              Start Free Trial <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {/* Mobile toggle */}
          <button className="md:hidden p-2" onClick={() => setMobileOpen(o => !o)}>
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-white border-b border-slate-200 px-6 py-4 space-y-1">
              {[["Features","#features"],["Pricing","#pricing"],["Contact","/contact"]].map(([l,h])=>(
                <a key={l} href={h} onClick={() => setMobileOpen(false)} className="block py-2.5 text-[14px] font-medium text-slate-700">{l}</a>
              ))}
              <div className="pt-3 flex flex-col gap-2">
                <Link href="/sign-in" className="block text-center py-2.5 border border-slate-200 rounded-xl text-[14px] font-semibold">Login</Link>
                <Link href="/contact" className="block text-center py-2.5 bg-indigo-600 text-white rounded-xl text-[14px] font-bold">Start Free Trial</Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden bg-white">
        {/* Background mesh */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[600px]"
            style={{ background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 w-full py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-6">
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-[12px] font-semibold px-4 py-1.5 rounded-full">
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse" />
                  Trusted by modern schools across Africa
                </div>
              </motion.div>

              <motion.div variants={fadeUp}>
                <h1 className="text-[52px] sm:text-[60px] lg:text-[68px] font-black leading-[1.02] tracking-[-0.03em] text-slate-900">
                  Run Your Entire<br />
                  School From One{" "}
                  <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                    Intelligent
                  </span>{" "}
                  Platform.
                </h1>
              </motion.div>

              <motion.p variants={fadeUp} className="text-[17px] text-slate-500 leading-relaxed max-w-[420px]">
                Admissions · Attendance · Academics · Finance · Communication · Reports — everything your school needs, seamlessly unified.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-4 rounded-2xl text-[15px] transition-all shadow-lg shadow-indigo-300/40 hover:shadow-indigo-300/60 hover:scale-[1.02] active:scale-[0.98]">
                  Start Free Trial <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-bold px-7 py-4 rounded-2xl text-[15px] transition-all hover:bg-indigo-50/50">
                  Book Demo
                </Link>
              </motion.div>

              <motion.div variants={fadeUp} className="flex items-center gap-4 pt-1">
                <div className="flex -space-x-2">
                  {["bg-indigo-500","bg-violet-500","bg-emerald-500","bg-amber-500","bg-rose-500"].map((c,i) => (
                    <div key={i} className={`w-8 h-8 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-[9px] font-black`}>
                      {["GH","KE","NG","RW","ZA"][i]}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex gap-0.5">
                    {[0,1,2,3,4].map(i => <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />)}
                  </div>
                  <p className="text-[12px] text-slate-500 mt-0.5"><span className="font-bold text-slate-700">500+ schools</span> trust Skula</p>
                </div>
              </motion.div>
            </motion.div>

            {/* Right — dashboard + floating cards */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative hidden lg:block">

              {/* Main dashboard */}
              <div className="relative z-10">
                <DashboardMockup />
              </div>

              {/* Floating card — attendance */}
              <FloatingCard className="top-[-20px] left-[-30px] z-20 w-44">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Attendance</span>
                </div>
                <p className="text-slate-900 text-xl font-black">98%</p>
                <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">↑ This week</p>
              </FloatingCard>

              {/* Floating card — students */}
              <FloatingCard className="top-[60px] right-[-30px] z-20 w-48" delay={0.8}>
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
                    <Users className="h-3.5 w-3.5 text-indigo-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Students</span>
                </div>
                <p className="text-slate-900 text-xl font-black">+1,250</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <TrendingUp className="h-3 w-3 text-indigo-500" />
                  <p className="text-[10px] text-indigo-600 font-semibold">Active this term</p>
                </div>
              </FloatingCard>

              {/* Floating card — fees */}
              <FloatingCard className="bottom-[40px] left-[-20px] z-20 w-52">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
                    <DollarSign className="h-3.5 w-3.5 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Fees Collected</span>
                </div>
                <p className="text-slate-900 text-xl font-black">GH₵ 450K</p>
                <p className="text-[10px] text-amber-600 font-semibold mt-0.5">Term 2 · 2025</p>
              </FloatingCard>

              {/* Floating card — satisfaction */}
              <FloatingCard className="bottom-[-10px] right-[-20px] z-20 w-44">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 bg-rose-100 rounded-lg flex items-center justify-center">
                    <Star className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Satisfaction</span>
                </div>
                <p className="text-slate-900 text-xl font-black">92%</p>
                <p className="text-[10px] text-rose-500 font-semibold mt-0.5">Parent rating</p>
              </FloatingCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST BAR ── */}
      <section className="border-y border-slate-100 bg-slate-50/50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <p className="text-center text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400 mb-8">
            Trusted by educational institutions across Africa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8">
            {[
              { name: "GoldCoast Academy",  type: "Private School" },
              { name: "Tema Community JHS", type: "Public School" },
              { name: "Accra Int'l School", type: "International" },
              { name: "Sunflower Academy",  type: "Basic School" },
              { name: "Heritage College",   type: "SHS" },
              { name: "Korle-Bu Prep",      type: "Preparatory" },
            ].map(({ name, type }) => (
              <div key={name} className="flex flex-col items-center gap-1">
                <div className="h-8 px-4 bg-white border border-slate-200 rounded-lg flex items-center shadow-sm">
                  <span className="text-[11px] font-black text-slate-700 whitespace-nowrap">{name}</span>
                </div>
                <span className="text-[9px] text-slate-400 font-medium">{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-16">
            <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">
              Full Platform
            </motion.p>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1]">
              Everything your school needs.<br />
              <span className="text-slate-400 font-light">Nothing you don't.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[17px] mt-5 max-w-xl mx-auto leading-relaxed">
              16 modules. One subscription. No per-feature pricing, no hidden limits.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Users,        color: "#6366f1", bg: "#eef2ff", title: "Admissions",             desc: "Online applications, enrollment workflows and student onboarding — all automated." },
              { icon: ClipboardList,color: "#0ea5e9", bg: "#f0f9ff", title: "Attendance Tracking",    desc: "Mark attendance per class from any device. Absent alerts sent to parents instantly." },
              { icon: DollarSign,   color: "#10b981", bg: "#f0fdf4", title: "Fee Collection",         desc: "Issue GHS receipts, track defaulters, send WhatsApp reminders automatically." },
              { icon: BookOpen,     color: "#8b5cf6", bg: "#faf5ff", title: "Exams & Marksheets",     desc: "Enter marks, auto-rank students, generate BECE-style report cards to print." },
              { icon: BarChart2,    color: "#f59e0b", bg: "#fffbeb", title: "Analytics & Reports",    desc: "Fee summaries, student lists, performance reports — PDF or CSV in one click." },
              { icon: MessageSquare,color: "#ec4899", bg: "#fdf4ff", title: "Communication",          desc: "Bulk SMS to parents, homework, notice board and internal staff messaging." },
              { icon: Bus,          color: "#14b8a6", bg: "#f0fdfa", title: "Transport",              desc: "Routes, vehicles, pickup points and transport fee management." },
              { icon: Library,      color: "#f97316", bg: "#fff7ed", title: "Library",                desc: "Book catalog, issue/return tracking and library membership management." },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp}
                whileHover={{ y: -4, boxShadow: "0 20px 40px rgba(0,0,0,0.08)" }}
                transition={{ duration: 0.2 }}
                className="group p-6 rounded-2xl border border-slate-100 bg-white cursor-default">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                  style={{ backgroundColor: bg }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-slate-900 font-bold text-[14px] mb-2">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE — alternating ── */}
      <section id="solutions" className="py-24 bg-slate-50">
        <div className="max-w-6xl mx-auto px-6 space-y-24">
          {[
            {
              eyebrow: "Student Information System",
              title: "Every student. Every detail. One place.",
              desc: "Enroll students, manage profiles, track BECE candidates, issue ID cards and promote entire classes in minutes — not days.",
              bullets: ["Bulk enrollment & promotion","BECE candidate management","Digital ID card generation","Parent portal access"],
              flip: false,
              accent: "#6366f1",
            },
            {
              eyebrow: "Finance & Fee Management",
              title: "Collect fees. Track every pesewa.",
              desc: "From setting up fee structures to issuing digital receipts on WhatsApp — Skula automates your entire finance workflow.",
              bullets: ["Automated GHS receipts","Defaulter tracking & reminders","Term-by-term fee reports","Multi-currency support"],
              flip: true,
              accent: "#10b981",
            },
            {
              eyebrow: "Exams & Academic Performance",
              title: "From marks to report cards automatically.",
              desc: "Teachers enter marks once. Skula calculates rankings, generates BECE-style report cards, and makes results available to parents instantly.",
              bullets: ["Automated grade calculation","Class ranking & reports","BECE-style report cards","Parent result portal"],
              flip: false,
              accent: "#8b5cf6",
            },
          ].map(({ eyebrow, title, desc, bullets, flip, accent }) => (
            <motion.div key={title} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} variants={stagger}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-14 items-center ${flip ? "lg:flex-row-reverse" : ""}`}
              style={{ direction: flip ? "rtl" : "ltr" }}>
              <div style={{ direction: "ltr" }}>
                <motion.p variants={fadeUp} className="text-[11px] font-bold uppercase tracking-[0.15em] mb-4" style={{ color: accent }}>
                  {eyebrow}
                </motion.p>
                <motion.h3 variants={fadeUp} className="text-[34px] sm:text-[40px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5">
                  {title}
                </motion.h3>
                <motion.p variants={fadeUp} className="text-slate-500 text-[16px] leading-relaxed mb-7">{desc}</motion.p>
                <motion.ul variants={stagger} className="space-y-3">
                  {bullets.map(b => (
                    <motion.li key={b} variants={fadeUp} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accent + "20" }}>
                        <Check className="h-3 w-3" style={{ color: accent }} />
                      </div>
                      <span className="text-slate-600 text-[14px]">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp} className="mt-8">
                  <Link href="/demo" className="inline-flex items-center gap-2 font-bold text-[14px] transition-colors hover:gap-3" style={{ color: accent }}>
                    See it live <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
              <motion.div variants={fadeIn} style={{ direction: "ltr" }}
                className="rounded-2xl overflow-hidden border border-slate-200/60 shadow-xl shadow-slate-200/60 bg-white">
                <DashboardMockup />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY SKULA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Why Switch</motion.p>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1]">
              Traditional management<br />vs <span className="text-indigo-600">Skula</span>
            </motion.h2>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}>
            <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm">
              {/* Header */}
              <div className="grid grid-cols-3 bg-slate-50 border-b border-slate-200">
                <div className="px-6 py-4 text-[12px] font-bold text-slate-400 uppercase tracking-wide">Capability</div>
                <div className="px-6 py-4 text-[12px] font-bold text-slate-500 uppercase tracking-wide text-center border-l border-slate-200">Traditional</div>
                <div className="px-6 py-4 text-[12px] font-bold text-indigo-600 uppercase tracking-wide text-center border-l border-slate-200 bg-indigo-50">Skula ✦</div>
              </div>
              {[
                ["Fee Collection","Manual receipts, cash only","Digital receipts, online payments, WhatsApp alerts"],
                ["Attendance","Paper registers, lost easily","Digital, real-time, parent SMS alerts"],
                ["Report Cards","Typed in Word, error-prone","Auto-generated from marks, print-ready"],
                ["Communication","WhatsApp groups, chaotic","Structured channels, bulk SMS, portal"],
                ["Analytics","None — end of term only","Live dashboards, trend analysis"],
                ["Access","Office only, office hours","Any device, anywhere, 24/7"],
                ["Data Safety","Physical files, fire risk","Cloud backup, 99.9% uptime, encrypted"],
              ].map(([cap, trad, skula]) => (
                <div key={cap} className="grid grid-cols-3 border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
                  <div className="px-6 py-4 text-[13px] font-semibold text-slate-700">{cap}</div>
                  <div className="px-6 py-4 text-[13px] text-slate-500 border-l border-slate-100 flex items-center gap-2">
                    <Minus className="h-3.5 w-3.5 text-red-400 shrink-0" />{trad}
                  </div>
                  <div className="px-6 py-4 text-[13px] text-indigo-700 font-medium border-l border-indigo-100 bg-indigo-50/40 flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 text-indigo-500 shrink-0" />{skula}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-20 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { n: "10,000+", l: "Students Managed" },
              { n: "500+",    l: "Schools" },
              { n: "99.9%",   l: "Uptime" },
              { n: "1M+",     l: "Attendance Records" },
            ].map(({ n, l }) => (
              <motion.div key={l} variants={fadeUp}>
                <p className="text-4xl sm:text-5xl font-black text-white mb-2">{n}</p>
                <p className="text-indigo-200 text-[13px] font-medium">{l}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-black tracking-tight text-slate-900">
              Loved by school leaders.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Skula, I spent every Friday afternoon printing fee receipts by hand. Now my accountant handles everything digitally and I just review the monthly report. It's been life-changing for our school.", name: "Mrs. Adjoa Asante", role: "Headmistress", school: "GoldCoast Academy, Accra", init: "AA", color: "#6366f1" },
              { quote: "The exam module alone saved us an entire week every term. We used to type report cards in Word and retype after every correction. Now we enter marks once and Skula does everything else.", name: "Mr. Kofi Acheampong", role: "Director", school: "Tema Community JHS", init: "KA", color: "#8b5cf6" },
              { quote: "Parents actually pay faster now because they receive a WhatsApp receipt the second the accountant records the payment. Our term 2 fee collections improved by nearly 30% after switching to Skula.", name: "Mrs. Ama Boateng", role: "Principal", school: "Sunflower Int'l, Kumasi", init: "AB", color: "#10b981" },
            ].map(({ quote, name, role, school, init, color }) => (
              <motion.div key={name} variants={fadeUp}
                className="bg-white p-7 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-600 text-[14px] leading-relaxed flex-1">"{quote}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-slate-100">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0" style={{ backgroundColor: color }}>
                    {init}
                  </div>
                  <div>
                    <p className="text-slate-900 text-[13px] font-bold">{name}</p>
                    <p className="text-slate-400 text-[11px]">{role} · {school}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Pricing</motion.p>
            <motion.h2 variants={fadeUp} className="text-[40px] sm:text-[48px] font-black tracking-tight text-slate-900">
              Simple, transparent pricing.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[16px] mt-4">
              Every plan includes all 16 modules. No per-feature fees.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                name: "Starter", price: "Free", sub: "30 days · no card",
                hl: false, cta: "Start free", href: "/demo",
                features: ["All 16 modules","Up to 200 students","Community support","Skula subdomain"],
              },
              {
                name: "Professional", price: "GH₵ 299", sub: "per month",
                hl: true, cta: "Get started", href: "/contact",
                features: ["Everything in Starter","Unlimited students","Priority WhatsApp support","Custom domain","Parent SMS alerts","Daily backups","Advanced analytics"],
              },
              {
                name: "Enterprise", price: "Custom", sub: "talk to us",
                hl: false, cta: "Contact sales", href: "/contact",
                features: ["Everything in Pro","Dedicated infrastructure","SLA guarantee","On-site training","Custom integrations","Dedicated account manager"],
              },
            ].map(({ name, price, sub, hl, features, cta, href }) => (
              <motion.div key={name} variants={fadeUp}
                className={`rounded-2xl p-8 border relative flex flex-col ${hl ? "bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-300/40 scale-[1.02]" : "bg-white border-slate-200 shadow-sm"}`}>
                {hl && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-black px-5 py-1.5 rounded-full whitespace-nowrap">
                    MOST POPULAR
                  </div>
                )}
                <div className="mb-6">
                  <p className={`text-[12px] font-bold uppercase tracking-wide mb-2 ${hl ? "text-indigo-200" : "text-slate-400"}`}>{name}</p>
                  <p className={`text-4xl font-black mb-1 ${hl ? "text-white" : "text-slate-900"}`}>{price}</p>
                  <p className={`text-[12px] ${hl ? "text-indigo-300" : "text-slate-400"}`}>{sub}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-3 text-[13px] ${hl ? "text-indigo-100" : "text-slate-600"}`}>
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${hl ? "bg-white/20" : "bg-indigo-50"}`}>
                        <Check className={`h-2.5 w-2.5 ${hl ? "text-white" : "text-indigo-600"}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href}
                  className={`block text-center py-3.5 rounded-xl font-bold text-[14px] transition-all ${hl ? "bg-white text-indigo-600 hover:bg-indigo-50" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}>
                  {cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">FAQ</motion.p>
            <motion.h2 variants={fadeUp} className="text-[40px] font-black tracking-tight text-slate-900">
              Frequently asked questions.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="space-y-3">
            {[
              { q: "How long does it take to set up?", a: "Most schools are fully live — classes, sections, fee types and staff accounts all configured — in under 30 minutes. We set it up with you on a call." },
              { q: "Do I need any technical knowledge?", a: "None at all. If you can use WhatsApp, you can use Skula. We also offer free onboarding support for every school, every time." },
              { q: "Can multiple staff use it simultaneously?", a: "Yes. Each staff member gets their own login with role-based access. Accountant sees fees, teacher sees their classes, admin sees everything — all at the same time." },
              { q: "Is my school data kept private?", a: "Completely. Every school runs in an isolated database. No other institution can ever access your students, fees, or records." },
              { q: "What happens when the free trial ends?", a: "We'll reach out before anything changes. Your data is never deleted. You can upgrade anytime, or we'll find a solution — we won't leave you stranded." },
              { q: "Does it work for Basic, JHS and SHS?", a: "Yes. Skula supports all levels of the Ghanaian school system including BECE candidate tracking, JHS grading scales, and term-based academic calendars." },
            ].map(({ q, a }) => (
              <motion.div key={q} variants={fadeUp}>
                <FaqItem q={q} a={a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Get in Touch</motion.p>
              <motion.h2 variants={fadeUp} className="text-[36px] sm:text-[44px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5">
                Ready to transform your school?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 text-[16px] leading-relaxed mb-8">
                Chat with us on WhatsApp and we'll have your school live today.
              </motion.p>
              <motion.div variants={stagger} className="space-y-4">
                {[
                  { icon: MessageSquare, label: "WhatsApp", val: "+233 595 111 461", color: "#25D366" },
                  { icon: Globe, label: "Website", val: "getskula.com", color: "#6366f1" },
                  { icon: Lock, label: "Data location", val: "West Africa · EU-compliant", color: "#8b5cf6" },
                ].map(({ icon: Icon, label, val, color }) => (
                  <motion.div key={label} variants={fadeUp} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
                      <Icon className="h-4 w-4" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[11px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                      <p className="text-slate-700 text-[14px] font-semibold">{val}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
              <h3 className="text-[18px] font-black text-slate-900 mb-1">Send us a message</h3>
              <p className="text-slate-400 text-[13px] mb-6">We reply within the hour on WhatsApp.</p>
              <div className="space-y-4">
                {[
                  { label: "Your name", placeholder: "e.g. Kofi Mensah", type: "text" },
                  { label: "School name", placeholder: "e.g. Lincoln Academy", type: "text" },
                  { label: "WhatsApp number", placeholder: "+233 XX XXX XXXX", type: "tel" },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">{label}</label>
                    <input type={type} placeholder={placeholder}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all" />
                  </div>
                ))}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white font-bold h-12 rounded-xl text-[14px] transition-colors mt-2">
                  <WhatsAppIcon className="h-4 w-4" />
                  Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-20"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%)" }}>
            {/* Dot grid */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.08) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
            <div className="relative">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/15 backdrop-blur text-white text-[11px] font-bold px-4 py-1.5 rounded-full border border-white/20 mb-6">
                <Zap className="h-3 w-3" /> Live in 30 minutes
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-[38px] sm:text-[52px] font-black text-white leading-[1.05] tracking-tight mb-5">
                Your school deserves<br />a system that works.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-indigo-200 text-[16px] mb-10 max-w-lg mx-auto leading-relaxed">
                Try the live demo — no sign-up needed. Or WhatsApp us and we'll have your school live before the day ends.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl hover:scale-[1.02]">
                  Try Demo Free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-8 py-4 rounded-2xl font-black text-[15px] transition-all shadow-xl hover:scale-[1.02]">
                  <WhatsAppIcon className="h-5 w-5" />
                  WhatsApp Us
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="text-indigo-300/80 text-[12px] mt-6">
                Free 30-day trial · GH₵ 299/mo after · Cancel anytime
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400">
        <div className="max-w-6xl mx-auto px-6 py-14">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-black text-[15px]">Skula</span>
              </div>
              <p className="text-[13px] leading-relaxed max-w-xs text-slate-500">
                The modern school management platform built for educational institutions across Africa.
              </p>
              <div className="flex gap-3 mt-5">
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-[#25D366] hover:text-[#4ade80] text-[12px] font-medium transition-colors">
                  <WhatsAppIcon className="h-3.5 w-3.5" /> WhatsApp
                </a>
              </div>
            </div>
            {[
              { title: "Product",   links: [["Features","/features"],["Pricing","#pricing"],["Demo","/demo"],["Changelog","/"]] },
              { title: "Company",   links: [["About","/"],["Blog","/"],["Contact","/contact"],["Novalss","https://novalss.com"]] },
              { title: "Legal",     links: [["Privacy","/"],["Terms","/"],["Security","/"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 mb-4">{title}</p>
                <div className="flex flex-col gap-2.5">
                  {links.map(([l,h]) => (
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="text-[13px] text-slate-400 hover:text-white transition-colors">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[12px] text-slate-600">© {new Date().getFullYear()} Novalss Ltd. All rights reserved.</p>
            <p className="text-[12px] text-slate-600">Made with ♥ for schools across Africa</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
