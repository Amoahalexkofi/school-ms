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

/* ─── STUDENTS MOCKUP ─── */
function StudentsMockup() {
  const students = [
    { name: "Abena Mensah",  class: "JHS 3A", id: "SKL-001", att: "97%",  status: "active" },
    { name: "Kwame Boateng", class: "JHS 3A", id: "SKL-002", att: "89%",  status: "active" },
    { name: "Ama Asante",    class: "JHS 3B", id: "SKL-003", att: "100%", status: "active" },
    { name: "Kofi Tetteh",   class: "JHS 2A", id: "SKL-004", att: "74%",  status: "warning" },
    { name: "Efua Darko",    class: "JHS 2B", id: "SKL-005", att: "93%",  status: "active" },
  ];
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100/80 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/students</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",true],["Fees",false],["Attendance",false],["Exams",false]].map(([l, a]) => (
            <div key={l as string} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium ${a ? "bg-indigo-600 text-white" : "text-slate-400"}`}>{l as string}</div>
          ))}
        </div>
        <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-black text-slate-900">Students</p>
              <p className="text-[9px] text-slate-400">1,247 enrolled · Term 2, 2025/26</p>
            </div>
            <div className="bg-indigo-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg">+ Add Student</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{l:"Total",v:"1,247",c:"text-indigo-600"},{l:"Active",v:"1,231",c:"text-emerald-600"},{l:"BECE Candidates",v:"342",c:"text-amber-600"}].map(({l,v,c})=>(
              <div key={l} className="bg-white rounded-xl p-2.5 border border-slate-100 text-center">
                <p className={`text-[14px] font-black ${c}`}>{v}</p>
                <p className="text-[8px] text-slate-400 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-4 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
              {["Name","Class","ID","Att."].map(h=><p key={h} className="text-[8px] font-bold text-slate-400 uppercase">{h}</p>)}
            </div>
            {students.map(({name,class:cls,id,att,status})=>(
              <div key={id} className="grid grid-cols-4 px-3 py-2 border-b border-slate-50 last:border-0 items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[7px] font-black text-indigo-600">{name[0]}</div>
                  <span className="text-[9px] font-semibold text-slate-700 truncate">{name}</span>
                </div>
                <span className="text-[9px] text-slate-500">{cls}</span>
                <span className="text-[9px] text-slate-400">{id}</span>
                <span className={`text-[9px] font-bold ${status==="warning"?"text-amber-500":"text-emerald-600"}`}>{att}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── FEES MOCKUP ─── */
function FeesMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100/80 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/fees</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",false],["Fees",true],["Attendance",false],["Exams",false]].map(([l, a]) => (
            <div key={l as string} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium ${a ? "bg-emerald-600 text-white" : "text-slate-400"}`}>{l as string}</div>
          ))}
        </div>
        <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-black text-slate-900">Fee Collection</p>
              <p className="text-[9px] text-slate-400">Term 2 · 2025/26</p>
            </div>
            <div className="bg-emerald-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg">Collect Fee</div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[{l:"Collected",v:"GH₵ 84.5K",c:"text-emerald-600",bg:"bg-emerald-50"},{l:"Pending",v:"GH₵ 12.3K",c:"text-amber-600",bg:"bg-amber-50"},{l:"Defaulters",v:"47",c:"text-red-500",bg:"bg-red-50"}].map(({l,v,c,bg})=>(
              <div key={l} className={`${bg} rounded-xl p-2.5 border border-slate-100 text-center`}>
                <p className={`text-[12px] font-black ${c}`}>{v}</p>
                <p className="text-[8px] text-slate-500 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-4 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
              {["Student","Amount","Date","Status"].map(h=><p key={h} className="text-[8px] font-bold text-slate-400 uppercase">{h}</p>)}
            </div>
            {[
              {n:"Abena M.",  amt:"GH₵ 450", date:"Jun 12", paid:true},
              {n:"Kwame B.",  amt:"GH₵ 380", date:"Jun 11", paid:true},
              {n:"Ama A.",    amt:"GH₵ 600", date:"Jun 10", paid:true},
              {n:"Kofi T.",   amt:"GH₵ 450", date:"—",      paid:false},
              {n:"Efua D.",   amt:"GH₵ 520", date:"Jun 9",  paid:true},
            ].map(({n,amt,date,paid})=>(
              <div key={n} className="grid grid-cols-4 px-3 py-2 border-b border-slate-50 last:border-0 items-center">
                <span className="text-[9px] font-semibold text-slate-700">{n}</span>
                <span className="text-[9px] font-bold text-emerald-700">{amt}</span>
                <span className="text-[9px] text-slate-400">{date}</span>
                <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full w-fit ${paid?"bg-emerald-100 text-emerald-700":"bg-amber-100 text-amber-700"}`}>{paid?"Paid":"Pending"}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── EXAMS MOCKUP ─── */
function ExamsMockup() {
  return (
    <div className="w-full rounded-2xl overflow-hidden border border-slate-200/80 bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100/80 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-red-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/exams/marksheet</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",false],["Fees",false],["Attendance",false],["Exams",true]].map(([l, a]) => (
            <div key={l as string} className={`px-2 py-1.5 rounded-lg text-[10px] font-medium ${a ? "bg-violet-600 text-white" : "text-slate-400"}`}>{l as string}</div>
          ))}
        </div>
        <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[12px] font-black text-slate-900">Marksheet · JHS 3A</p>
              <p className="text-[9px] text-slate-400">End of Term 2 Exams · 28 students</p>
            </div>
            <div className="bg-violet-600 text-white text-[9px] font-bold px-2.5 py-1 rounded-lg">Print Cards</div>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
            <div className="grid grid-cols-6 px-3 py-1.5 bg-slate-50 border-b border-slate-100">
              {["#","Name","Math","English","Science","Grade"].map(h=><p key={h} className="text-[8px] font-bold text-slate-400 uppercase">{h}</p>)}
            </div>
            {[
              {rank:1, name:"Ama A.",    math:92, eng:88, sci:94, grade:"A1"},
              {rank:2, name:"Abena M.",  math:87, eng:91, sci:85, grade:"A2"},
              {rank:3, name:"Efua D.",   math:83, eng:79, sci:88, grade:"B2"},
              {rank:4, name:"Kwame B.",  math:76, eng:82, sci:74, grade:"B3"},
              {rank:5, name:"Kofi T.",   math:68, eng:71, sci:65, grade:"C4"},
            ].map(({rank,name,math,eng,sci,grade})=>(
              <div key={name} className={`grid grid-cols-6 px-3 py-2 border-b border-slate-50 last:border-0 items-center ${rank===1?"bg-amber-50/50":""}`}>
                <span className={`text-[9px] font-black ${rank===1?"text-amber-500":"text-slate-400"}`}>{rank}</span>
                <span className="text-[9px] font-semibold text-slate-700">{name}</span>
                <span className="text-[9px] text-slate-600">{math}</span>
                <span className="text-[9px] text-slate-600">{eng}</span>
                <span className="text-[9px] text-slate-600">{sci}</span>
                <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md w-fit ${grade.startsWith("A")?"bg-emerald-100 text-emerald-700":grade.startsWith("B")?"bg-indigo-100 text-indigo-700":"bg-amber-100 text-amber-700"}`}>{grade}</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            <div className="flex-1 bg-white rounded-lg border border-slate-100 p-2 text-center">
              <p className="text-[11px] font-black text-violet-600">82.4%</p>
              <p className="text-[8px] text-slate-400">Class average</p>
            </div>
            <div className="flex-1 bg-white rounded-lg border border-slate-100 p-2 text-center">
              <p className="text-[11px] font-black text-emerald-600">96%</p>
              <p className="text-[8px] text-slate-400">Pass rate</p>
            </div>
            <div className="flex-1 bg-white rounded-lg border border-slate-100 p-2 text-center">
              <p className="text-[11px] font-black text-indigo-600">28</p>
              <p className="text-[8px] text-slate-400">Cards ready</p>
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
            <Link href="/sign-in" className="text-[13px] font-semibold text-slate-700 hover:text-indigo-600 px-4 py-2 rounded-xl border border-slate-300 hover:border-indigo-400 transition-colors">
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
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden" style={{ background: "linear-gradient(135deg, #c7d2fe 0%, #ddd6fe 40%, #bae6fd 72%, #f8fafc 100%)" }}>
        {/* Background layers */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Large indigo blob top-left */}
          <div className="absolute -top-32 -left-32 w-[700px] h-[700px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.22) 0%, transparent 70%)" }} />
          {/* Violet blob center-right */}
          <div className="absolute top-10 right-[-100px] w-[600px] h-[600px] rounded-full"
            style={{ background: "radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)" }} />
          {/* Cyan accent bottom */}
          <div className="absolute bottom-0 left-1/3 w-[500px] h-[300px]"
            style={{ background: "radial-gradient(ellipse, rgba(6,182,212,0.14) 0%, transparent 70%)" }} />
          {/* Dot grid */}
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.12) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
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
                <h1 className="text-[36px] sm:text-[52px] lg:text-[68px] font-black leading-[1.02] tracking-[-0.03em] text-slate-900">
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

            {/* Mobile hero image — hidden on lg */}
            <motion.div variants={fadeUp} className="lg:hidden flex justify-center -mt-2">
              <img src="/images/hero image1.png" alt="Student using Skula"
                className="h-56 sm:h-72 object-contain drop-shadow-xl" />
            </motion.div>

            {/* Right — student image + floating cards (desktop only) */}
            <motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative hidden lg:flex items-center justify-center h-[520px]">

              {/* Hero student image — centrepiece */}
              <div className="relative z-10 w-full max-w-[460px] flex items-end justify-center h-full">
                <img
                  src="/images/hero image1.png"
                  alt="Student using Skula"
                  className="w-full h-full object-contain object-bottom drop-shadow-2xl"
                />
              </div>

              {/* Card — top left, above dashboard */}
              <FloatingCard className="top-0 left-[-16px] z-20 w-48" delay={0}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-none">Attendance</p>
                  </div>
                </div>
                <p className="text-slate-900 text-2xl font-black leading-none">98%</p>
                <p className="text-[11px] text-emerald-600 font-semibold mt-1">↑ Best week this term</p>
              </FloatingCard>

              {/* Card — top right */}
              <FloatingCard className="top-6 right-[-16px] z-20 w-48" delay={1.2}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Users className="h-4 w-4 text-indigo-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Students</p>
                </div>
                <p className="text-slate-900 text-2xl font-black leading-none">1,250</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-indigo-500" />
                  <p className="text-[11px] text-indigo-600 font-semibold">+12 this term</p>
                </div>
              </FloatingCard>

              {/* Card — bottom left */}
              <FloatingCard className="bottom-4 left-[-16px] z-20 w-52" delay={0.6}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
                    <DollarSign className="h-4 w-4 text-amber-600" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Fees Collected</p>
                </div>
                <p className="text-slate-900 text-2xl font-black leading-none">GH₵ 450K</p>
                <p className="text-[11px] text-amber-600 font-semibold mt-1">Term 2 · 2025/26</p>
              </FloatingCard>

              {/* Card — bottom right */}
              <FloatingCard className="bottom-0 right-[-16px] z-20 w-44" delay={1.8}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="w-8 h-8 bg-rose-100 rounded-xl flex items-center justify-center">
                    <Star className="h-4 w-4 text-rose-500 fill-rose-500" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Parents</p>
                </div>
                <p className="text-slate-900 text-2xl font-black leading-none">92%</p>
                <p className="text-[11px] text-rose-500 font-semibold mt-1">Satisfaction rate</p>
              </FloatingCard>

            </motion.div>
          </div>
        </div>

        {/* Bottom wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="w-full h-20 sm:h-28" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,45 C180,90 360,0 540,45 C720,90 900,0 1080,45 C1260,90 1350,20 1440,45 L1440,90 L0,90 Z" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="py-24 relative" style={{ background: "linear-gradient(180deg, #ffffff 0%, #f8faff 100%)" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.05) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="text-center mb-16">
            <motion.div variants={fadeUp}>
              <span className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold px-4 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> Full Platform
              </span>
            </motion.div>
            <motion.h2 variants={fadeUp} className="text-[36px] sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1] mt-5">
              Everything your school needs.<br />
              <span className="text-slate-400 font-light italic">Nothing you don't.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[17px] mt-5 max-w-xl mx-auto leading-relaxed">
              16 modules. One subscription. No per-feature pricing, no hidden limits.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Users,        color: "#6366f1", bg: "#eef2ff", title: "Admissions",           desc: "Online applications, enrollment workflows and student onboarding — all automated." },
              { icon: ClipboardList,color: "#0ea5e9", bg: "#e0f2fe", title: "Attendance Tracking",  desc: "Mark attendance per class from any device. Absent alerts sent to parents instantly." },
              { icon: DollarSign,   color: "#10b981", bg: "#dcfce7", title: "Fee Collection",       desc: "Issue GHS receipts, track defaulters, send WhatsApp reminders automatically." },
              { icon: BookOpen,     color: "#8b5cf6", bg: "#ede9fe", title: "Exams & Marksheets",   desc: "Enter marks, auto-rank students, generate BECE-style report cards to print." },
              { icon: BarChart2,    color: "#f59e0b", bg: "#fef3c7", title: "Analytics & Reports",  desc: "Fee summaries, student lists, performance reports — PDF or CSV in one click." },
              { icon: MessageSquare,color: "#ec4899", bg: "#fce7f3", title: "Communication",        desc: "Bulk SMS to parents, homework, notice board and internal staff messaging." },
              { icon: Bus,          color: "#14b8a6", bg: "#ccfbf1", title: "Transport",            desc: "Routes, vehicles, pickup points and transport fee management." },
              { icon: Library,      color: "#f97316", bg: "#ffedd5", title: "Library",              desc: "Book catalog, issue/return tracking and library membership management." },
            ].map(({ icon: Icon, color, bg, title, desc }, i) => (
              <motion.div key={title} variants={fadeUp}
                whileHover={{ y: -6 }} transition={{ duration: 0.2 }}
                className="group relative p-6 rounded-2xl bg-white border border-slate-100 cursor-default overflow-hidden"
                style={{ boxShadow: "0 2px 16px rgba(0,0,0,0.04)" }}>
                <div className="absolute top-0 left-6 right-6 h-[2px] rounded-b-full transition-all duration-300 group-hover:left-0 group-hover:right-0"
                  style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }} />
                <span className="absolute top-4 right-5 text-[11px] font-black tracking-widest select-none"
                  style={{ color: color + "25" }}>{String(i + 1).padStart(2, "0")}</span>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ backgroundColor: bg }}>
                  <Icon className="h-[22px] w-[22px]" style={{ color }} />
                </div>
                <h3 className="text-slate-900 font-bold text-[15px] mb-2">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE ── */}
      <section id="solutions" className="py-24" style={{ background: "linear-gradient(180deg, #f8faff 0%, #ffffff 100%)" }}>
        <div className="max-w-6xl mx-auto px-6 space-y-28">
          {[
            { eyebrow: "Student Information System",  title: "Every student. Every detail. One place.",         desc: "Enroll students, manage profiles, track BECE candidates, issue ID cards and promote entire classes in minutes — not days.",                                              bullets: ["Bulk enrollment & promotion","BECE candidate management","Digital ID card generation","Parent portal access"],    flip: false, accent: "#6366f1", accentBg: "#eef2ff", Mockup: StudentsMockup },
            { eyebrow: "Finance & Fee Management",    title: "Collect fees. Track every pesewa.",               desc: "From setting up fee structures to issuing digital receipts on WhatsApp — Skula automates your entire finance workflow.",                                             bullets: ["Automated GHS receipts","Defaulter tracking & reminders","Term-by-term fee reports","Multi-currency support"],   flip: true,  accent: "#10b981", accentBg: "#dcfce7", Mockup: FeesMockup    },
            { eyebrow: "Exams & Academic Performance",title: "From marks to report cards automatically.",       desc: "Teachers enter marks once. Skula calculates rankings, generates BECE-style report cards, and makes results available to parents instantly.",                         bullets: ["Automated grade calculation","Class ranking & reports","BECE-style report cards","Parent result portal"],         flip: false, accent: "#8b5cf6", accentBg: "#ede9fe", Mockup: ExamsMockup   },
          ].map(({ eyebrow, title, desc, bullets, flip, accent, accentBg, Mockup }) => (
            <motion.div key={title} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
              <div className={flip ? "lg:order-2" : ""}>
                <motion.div variants={fadeUp}>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full mb-5"
                    style={{ backgroundColor: accentBg, color: accent }}>{eyebrow}</span>
                </motion.div>
                <motion.h3 variants={fadeUp} className="text-[30px] sm:text-[38px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5">{title}</motion.h3>
                <motion.p variants={fadeUp} className="text-slate-500 text-[16px] leading-relaxed mb-7">{desc}</motion.p>
                <motion.ul variants={stagger} className="space-y-3 mb-8">
                  {bullets.map(b => (
                    <motion.li key={b} variants={fadeUp} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentBg }}>
                        <Check className="h-3.5 w-3.5" style={{ color: accent }} />
                      </div>
                      <span className="text-slate-700 text-[14px] font-medium">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp}>
                  <Link href="/demo" className="inline-flex items-center gap-2 font-bold text-[14px] px-5 py-2.5 rounded-xl transition-all hover:gap-3"
                    style={{ backgroundColor: accentBg, color: accent }}>
                    See it live <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
              <motion.div variants={fadeIn} className={flip ? "lg:order-1" : ""}
                style={{ filter: `drop-shadow(0 24px 48px ${accent}20)` }}>
                <div className="rounded-2xl overflow-hidden border bg-white"
                  style={{ borderColor: accent + "20", boxShadow: `0 0 0 1px ${accent}10, 0 24px 48px ${accent}10` }}>
                  <Mockup />
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHY SKULA ── */}
      <section className="py-24 bg-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.025) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Why Switch</motion.p>
            <motion.h2 variants={fadeUp} className="text-[36px] sm:text-[48px] font-black tracking-tight text-white leading-[1.1]">
              Traditional management<br />vs <span className="text-indigo-400">Skula</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-[16px] mt-4">See why modern schools are making the switch.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}>
            <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.06)" }}>
              <div className="min-w-[580px] overflow-hidden rounded-2xl">
                <div className="grid grid-cols-3 border-b border-white/10" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <div className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Capability</div>
                  <div className="px-6 py-4 text-[11px] font-bold text-red-400 uppercase tracking-widest text-center border-l border-white/10">Traditional</div>
                  <div className="px-6 py-4 text-[11px] font-bold text-indigo-400 uppercase tracking-widest text-center border-l border-indigo-500/30 bg-indigo-500/10">Skula ✦</div>
                </div>
                {[
                  ["Fee Collection","Manual receipts, cash only","Digital receipts + WhatsApp alerts"],
                  ["Attendance","Paper registers, easily lost","Digital, real-time, parent SMS"],
                  ["Report Cards","Typed in Word, error-prone","Auto-generated from marks, print-ready"],
                  ["Communication","WhatsApp groups, chaotic","Structured channels, bulk SMS, portal"],
                  ["Analytics","None — end of term only","Live dashboards, trend analysis"],
                  ["Access","Office only, office hours","Any device, anywhere, 24/7"],
                  ["Data Safety","Physical files, fire risk","Cloud backup, 99.9% uptime, encrypted"],
                ].map(([cap, trad, skula]) => (
                  <div key={cap} className="grid grid-cols-3 border-b border-white/[0.05] last:border-0 hover:bg-white/[0.02] transition-colors">
                    <div className="px-6 py-4 text-[13px] font-semibold text-slate-300">{cap}</div>
                    <div className="px-6 py-4 text-[13px] text-red-400/80 border-l border-white/[0.05] flex items-start gap-2">
                      <Minus className="h-3.5 w-3.5 mt-0.5 shrink-0 text-red-500" />{trad}
                    </div>
                    <div className="px-6 py-4 text-[13px] text-indigo-300 font-medium border-l border-indigo-500/20 bg-indigo-500/[0.07] flex items-start gap-2">
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-indigo-400" />{skula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-indigo-500/40 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-violet-500/25 rounded-full blur-[80px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: "10,000+", l: "Students Managed",   icon: Users },
              { n: "500+",    l: "Schools Active",      icon: GraduationCap },
              { n: "99.9%",   l: "Uptime SLA",          icon: Shield },
              { n: "30 min",  l: "To Go Live",          icon: Clock },
            ].map(({ n, l, icon: Icon }, i) => (
              <motion.div key={l} variants={fadeUp}
                className={`text-center py-10 px-4 ${i < 3 ? "md:border-r border-white/15" : ""} ${i % 2 === 0 && i < 3 ? "border-r border-white/15 md:border-r-0" : ""}`}>
                <div className="w-11 h-11 mx-auto mb-4 rounded-xl bg-white/10 flex items-center justify-center">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white mb-1.5 tracking-tight">{n}</p>
                <p className="text-indigo-200 text-[13px] font-medium">{l}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 bg-slate-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.018) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 70%)" }} />
        <div className="relative max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-indigo-400 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="text-[36px] sm:text-[48px] font-black tracking-tight text-white">
              Loved by school leaders.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { quote: "Before Skula, I spent every Friday printing fee receipts by hand. Now my accountant handles everything digitally and I just review the monthly report. Life-changing.", name: "Mrs. Adjoa A.", role: "Headmistress", school: "Private School, Accra", init: "AA", color: "#6366f1" },
              { quote: "The exam module alone saved us an entire week every term. We used to type report cards in Word and retype after every correction. Now we enter marks once and Skula does the rest.", name: "Mr. Kofi A.", role: "Director", school: "Basic School, Greater Accra", init: "KA", color: "#8b5cf6" },
              { quote: "Parents pay faster because they get a WhatsApp receipt the moment the accountant records payment. Our fee collections improved by nearly 30% after switching.", name: "Mrs. Ama B.", role: "Principal", school: "International School, Kumasi", init: "AB", color: "#10b981" },
            ].map(({ quote, name, role, school, init, color }) => (
              <motion.div key={name} variants={fadeUp}
                className="relative p-7 rounded-2xl flex flex-col"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <span className="absolute top-4 right-6 text-[72px] leading-none font-black pointer-events-none select-none"
                  style={{ color: color + "18" }}>"</span>
                <div className="flex gap-0.5 mb-4">
                  {[0,1,2,3,4].map(i => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-slate-300 text-[14px] leading-relaxed flex-1 relative z-10">"{quote}"</p>
                <div className="flex items-center gap-3 mt-6 pt-5 border-t border-white/[0.07]">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[11px] font-black shrink-0 ring-2 ring-white/10"
                    style={{ backgroundColor: color }}>{init}</div>
                  <div>
                    <p className="text-white text-[13px] font-bold">{name}</p>
                    <p className="text-slate-500 text-[11px]">{role} · {school}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="py-24 relative overflow-hidden" style={{ background: "linear-gradient(160deg, #f5f3ff 0%, #eef2ff 50%, #f0f9ff 100%)" }}>
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

          <div className="absolute inset-0 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.06) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="relative grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
            {[
              { name: "Starter",      price: "Free",     sub: "30 days · no card needed",    hl: false, cta: "Try for free",   href: "/demo",    features: ["All 16 modules","Up to 200 students","Community support","Skula subdomain"] },
              { name: "Professional", price: "GH₵ 299",  sub: "/ month, billed monthly",     hl: true,  cta: "Get started →",  href: "/contact", features: ["Everything in Starter","Unlimited students","Priority WhatsApp support","Custom domain","Parent SMS alerts","Daily backups","Advanced analytics"] },
              { name: "Enterprise",   price: "Custom",   sub: "let's talk",                  hl: false, cta: "Contact sales",  href: "/contact", features: ["Everything in Pro","Dedicated infrastructure","SLA guarantee","On-site training","Custom integrations","Dedicated account manager"] },
            ].map(({ name, price, sub, hl, features, cta, href }) => (
              <motion.div key={name} variants={fadeUp}
                className={`rounded-2xl p-8 border relative flex flex-col ${hl ? "border-indigo-500 shadow-2xl shadow-indigo-300/30 scale-[1.03] z-10" : "bg-white border-slate-200/80 shadow-sm"}`}
                style={hl ? { background: "linear-gradient(160deg, #4f46e5 0%, #7c3aed 100%)" } : {}}>
                {hl && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-amber-900 text-[11px] font-black px-5 py-1.5 rounded-full whitespace-nowrap shadow-lg">
                    ✦ MOST POPULAR
                  </div>
                )}
                <div className="mb-7">
                  <p className={`text-[11px] font-bold uppercase tracking-widest mb-3 ${hl ? "text-indigo-200" : "text-slate-400"}`}>{name}</p>
                  <p className={`text-5xl font-black leading-none mb-2 ${hl ? "text-white" : "text-slate-900"}`}>{price}</p>
                  <p className={`text-[12px] ${hl ? "text-indigo-300" : "text-slate-400"}`}>{sub}</p>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-3 text-[13px] ${hl ? "text-indigo-100" : "text-slate-600"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hl ? "bg-white/15" : "bg-indigo-50"}`}>
                        <Check className={`h-3 w-3 ${hl ? "text-white" : "text-indigo-600"}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href}
                  className={`block text-center py-3.5 rounded-xl font-bold text-[14px] transition-all ${hl ? "bg-white text-indigo-600 hover:bg-indigo-50 shadow-lg" : "bg-slate-900 text-white hover:bg-slate-800"}`}>
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
      <section className="py-24 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.15em] mb-4">Get in Touch</motion.p>
              <motion.h2 variants={fadeUp} className="text-[32px] sm:text-[44px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5">
                Ready to transform<br />your school?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 text-[16px] leading-relaxed mb-10">
                Chat with us on WhatsApp and we'll have your school live today.
              </motion.p>
              <motion.div variants={stagger} className="space-y-3">
                {[
                  { icon: MessageSquare, label: "WhatsApp",     val: "+233 595 111 461",           color: "#25D366" },
                  { icon: Globe,         label: "Website",      val: "getskula.com",               color: "#6366f1" },
                  { icon: Lock,          label: "Data",         val: "West Africa · EU-compliant", color: "#8b5cf6" },
                ].map(({ icon: Icon, label, val, color }) => (
                  <motion.div key={label} variants={fadeUp}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-100 bg-slate-50">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "15" }}>
                      <Icon className="h-5 w-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{label}</p>
                      <p className="text-slate-800 text-[14px] font-semibold mt-0.5">{val}</p>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-3xl border border-slate-200 p-8"
              style={{ boxShadow: "0 8px 48px rgba(0,0,0,0.07)" }}>
              <h3 className="text-[20px] font-black text-slate-900 mb-1">Send us a message</h3>
              <p className="text-slate-400 text-[13px] mb-7">We reply within the hour on WhatsApp.</p>
              <div className="space-y-4">
                {[
                  { label: "Your name",       placeholder: "e.g. Kofi Mensah",     type: "text" },
                  { label: "School name",     placeholder: "e.g. Lincoln Academy", type: "text" },
                  { label: "WhatsApp number", placeholder: "+233 XX XXX XXXX",      type: "tel"  },
                ].map(({ label, placeholder, type }) => (
                  <div key={label}>
                    <label className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
                    <input type={type} placeholder={placeholder}
                      className="w-full h-12 rounded-xl border border-slate-200 bg-slate-50 px-4 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 focus:bg-white transition-all" />
                  </div>
                ))}
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fba5a] text-white font-bold py-3.5 rounded-xl text-[15px] transition-all hover:scale-[1.01] shadow-lg shadow-green-300/25 mt-2">
                  <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-20"
            style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #4f46e5 40%, #7c3aed 70%, #1d4ed8 100%)" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none" />
            <div className="relative">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur text-white text-[12px] font-bold px-5 py-2 rounded-full border border-white/20 mb-8">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Live in 30 minutes — guaranteed
              </motion.div>
              <motion.h2 variants={fadeUp} className="text-[34px] sm:text-[52px] font-black text-white leading-[1.05] tracking-tight mb-5">
                Your school deserves<br />a system that works.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-indigo-200 text-[17px] mb-10 max-w-lg mx-auto leading-relaxed">
                Try the live demo — no sign-up. Or WhatsApp us and we'll have your school live before the day ends.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/demo"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-slate-100 px-8 py-4 rounded-2xl font-black text-[15px] transition-all shadow-2xl hover:scale-[1.02]">
                  Try Demo Free <ArrowRight className="h-4 w-4" />
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-8 py-4 rounded-2xl font-black text-[15px] transition-all shadow-2xl hover:scale-[1.02]">
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp Us
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="text-white/35 text-[12px] mt-7">
                Free 30-day trial · GH₵ 299/mo after · Cancel anytime
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-950 text-slate-400 relative overflow-hidden">
        <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(99,102,241,0.7), rgba(139,92,246,0.7), transparent)" }} />
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.015) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="relative max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <GraduationCap className="h-4 w-4 text-white" />
                </div>
                <span className="text-white font-black text-[17px] tracking-tight">Skula</span>
              </div>
              <p className="text-[13px] leading-relaxed max-w-[210px] text-slate-500 mb-6">
                The modern school management platform built for Africa.
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/25 text-[#4ade80] text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors">
                <WhatsAppIcon className="h-3.5 w-3.5" /> Chat on WhatsApp
              </a>
            </div>
            {[
              { title: "Product", links: [["Features","/features"],["Pricing","#pricing"],["Demo","/demo"],["Changelog","/"]] },
              { title: "Company", links: [["About","/"],["Blog","/"],["Contact","/contact"],["Novalss","https://novalss.com"]] },
              { title: "Legal",   links: [["Privacy","/"],["Terms","/"],["Security","/"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 mb-5">{title}</p>
                <div className="flex flex-col gap-3">
                  {links.map(([l,h]) => (
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="text-[13px] text-slate-500 hover:text-white transition-colors w-fit">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.06] pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[12px] text-slate-600">© {new Date().getFullYear()} Novalss Ltd. All rights reserved.</p>
            <p className="text-[12px] text-slate-600">Made with ♥ for schools across Africa</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
