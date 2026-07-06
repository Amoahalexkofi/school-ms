"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  GraduationCap, ArrowRight, Users, DollarSign, ClipboardList,
  BookOpen, BarChart2, MessageSquare, CheckCircle2, ChevronDown,
  TrendingUp, Shield, Clock, Smartphone, Bell, FileText,
  Bus, Library, ChevronRight, Star, Zap, Globe,
  Lock, Check, Minus, CreditCard, Mail, Home, CalendarDays,
  UserCheck, Package, Building2, Award, Banknote,
} from "lucide-react";

import { SkulaNav } from "@/components/SkulaNav";

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
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as any } },
};
const stagger = { show: { transition: { staggerChildren: 0.08 } } };
const fadeIn = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.4 } } };

/* ─── DASHBOARD MOCKUP ─── */
function DashboardMockup() {
  return (
    <div className="w-full overflow-hidden bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">
          app.getskula.com/dashboard
        </div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[140px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center">
              <GraduationCap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[
            { icon: BarChart2, label: "Dashboard", active: true },
            { icon: Users,        label: "Students",   active: false },
            { icon: DollarSign,   label: "Fees",        active: false },
            { icon: ClipboardList,label: "Attendance",  active: false },
            { icon: BookOpen,     label: "Exams",       active: false },
            { icon: FileText,     label: "Reports",     active: false },
          ].map(({ icon: Icon, label, active }) => (
            <div key={label} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-[10px] font-medium ${active ? "bg-indigo-600 text-white" : "text-slate-400"}`}>
              <Icon className="h-3 w-3 shrink-0" />{label}
            </div>
          ))}
        </div>
        <div className="flex-1 bg-slate-50 p-4 overflow-hidden">
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
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { label: "Students",  val: "1,247", trend: "+12",  icon: Users,         bg: "bg-indigo-500", light: "bg-indigo-50" },
              { label: "Fees (GHS)",val: "84.5K", trend: "+8%",  icon: DollarSign,    bg: "bg-emerald-500",light: "bg-emerald-50" },
              { label: "Attendance",val: "94%",   trend: "+2%",  icon: ClipboardList, bg: "bg-amber-500",  light: "bg-amber-50" },
              { label: "Staff",     val: "86",    trend: "+3",   icon: Shield,        bg: "bg-violet-500", light: "bg-violet-50" },
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
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 mb-2">Weekly Attendance</p>
              <div className="flex items-end gap-1 h-14">
                {[78,85,92,88,95,82,91].map((h,i) => (
                  <div key={i} className="flex-1 flex flex-col justify-end">
                    <div className={`rounded-sm ${i===4?"bg-indigo-600":"bg-indigo-200"}`} style={{ height: `${h}%` }} />
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-1">
                {["M","T","W","T","F","S","S"].map((d,i) => (
                  <span key={i} className="flex-1 text-center text-[7px] text-slate-400">{d}</span>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-3 border border-slate-100">
              <p className="text-[9px] font-bold text-slate-500 mb-2">Recent Fees</p>
              {[["Kwame A.","450"],["Abena M.","380"],["Kofi T.","600"]].map(([n,a]) => (
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
    <div className="w-full overflow-hidden bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/students</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",true],["Fees",false],["Attendance",false],["Exams",false]].map(([l,a]) => (
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
    <div className="w-full overflow-hidden bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/fees</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",false],["Fees",true],["Attendance",false],["Exams",false]].map(([l,a]) => (
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
            {[{l:"Collected",v:"GH₵ 84.5K",c:"text-emerald-600",bg:"bg-emerald-50"},{l:"Pending",v:"GH₵ 12.3K",c:"text-amber-600",bg:"bg-amber-50"},{l:"Defaulters",v:"47",c:"text-rose-500",bg:"bg-rose-50"}].map(({l,v,c,bg})=>(
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
              {n:"Abena M.", amt:"GH₵ 450",date:"Jun 12",paid:true},
              {n:"Kwame B.", amt:"GH₵ 380",date:"Jun 11",paid:true},
              {n:"Ama A.",   amt:"GH₵ 600",date:"Jun 10",paid:true},
              {n:"Kofi T.",  amt:"GH₵ 450",date:"—",     paid:false},
              {n:"Efua D.",  amt:"GH₵ 520",date:"Jun 9", paid:true},
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
    <div className="w-full overflow-hidden bg-white">
      <div className="flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 border-b border-slate-200">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" /><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
        <div className="mx-auto flex-1 max-w-xs bg-white border border-slate-200 rounded px-3 py-0.5 text-[10px] text-slate-400 text-center">app.getskula.com/exams/marksheet</div>
      </div>
      <div className="flex h-[340px]">
        <div className="w-[130px] shrink-0 bg-slate-900 flex flex-col p-3 gap-0.5">
          <div className="flex items-center gap-1.5 px-2 py-2 mb-3">
            <div className="w-6 h-6 bg-indigo-500 rounded-md flex items-center justify-center"><GraduationCap className="h-3.5 w-3.5 text-white" /></div>
            <span className="text-white text-[11px] font-black">Skula</span>
          </div>
          {[["Dashboard",false],["Students",false],["Fees",false],["Attendance",false],["Exams",true]].map(([l,a]) => (
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
              {rank:1,name:"Ama A.",   math:92,eng:88,sci:94,grade:"A1"},
              {rank:2,name:"Abena M.", math:87,eng:91,sci:85,grade:"A2"},
              {rank:3,name:"Efua D.",  math:83,eng:79,sci:88,grade:"B2"},
              {rank:4,name:"Kwame B.", math:76,eng:82,sci:74,grade:"B3"},
              {rank:5,name:"Kofi T.",  math:68,eng:71,sci:65,grade:"C4"},
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

/* ─── HERO IMAGE + PRODUCT CARDS ─── */
// Soft entrance + a slow, out-of-sync vertical drift so the stat cards read as a
// single living product collage rather than four static boxes.
function FloatCard({
  children, className, style, delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  delay?: number;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, scale: 0.92, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: [0, -7, 0] }}
      transition={{
        opacity: { duration: 0.5, delay, ease: "easeOut" },
        scale:   { duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] },
        y:       { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: delay + 0.6 },
      }}
    >
      {children}
    </motion.div>
  );
}

const STAT_CARD =
  "absolute z-20 bg-white/95 backdrop-blur-sm rounded-2xl ring-1 ring-slate-900/[0.06] px-4 py-3 flex items-center gap-3";
const STAT_SHADOW: React.CSSProperties = {
  boxShadow: "0 1px 2px rgba(15,23,42,0.04), 0 18px 40px -14px rgba(15,23,42,0.25)",
};

function HeroProduct() {
  return (
    <div className="relative flex items-end justify-center h-[520px]">
      {/* Grounding glow behind the student */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[360px] h-[360px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(99,102,241,0.20) 0%, transparent 68%)" }} />
      {/* Soft contact shadow ellipse to seat the figure on the page */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 w-[280px] h-7 rounded-[50%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(15,23,42,0.13) 0%, transparent 70%)", filter: "blur(3px)" }} />

      {/* Student image */}
      <div className="relative z-10 w-full max-w-[460px] h-full flex items-end justify-center">
        <img src="/images/hero-1.webp" alt="Student using Skula"
          className="w-full h-full object-contain object-bottom drop-shadow-2xl" />
      </div>

      {/* Fee received — top-left */}
      <FloatCard delay={0.35} className={`${STAT_CARD} top-0 left-[-16px]`} style={STAT_SHADOW}>
        <div className="w-9 h-9 rounded-xl bg-emerald-50 ring-1 ring-emerald-500/15 flex items-center justify-center shrink-0">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-900 leading-none">Fee Received</p>
          <p className="text-[11px] text-slate-500 mt-1">GH₵ 450 · Kwame Boateng</p>
        </div>
      </FloatCard>

      {/* Students count — top-right */}
      <FloatCard delay={0.5} className={`${STAT_CARD} top-6 right-[-16px]`} style={STAT_SHADOW}>
        <div className="w-9 h-9 rounded-xl bg-indigo-50 ring-1 ring-indigo-500/15 flex items-center justify-center shrink-0">
          <Users className="h-4 w-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-900 leading-none">1,250 Students</p>
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3 text-indigo-500" />
            <p className="text-[11px] text-indigo-600 font-semibold">+12 this term</p>
          </div>
        </div>
      </FloatCard>

      {/* Fees collected — bottom-left */}
      <FloatCard delay={0.65} className={`${STAT_CARD} bottom-4 left-[-16px]`} style={STAT_SHADOW}>
        <div className="w-9 h-9 rounded-xl bg-amber-50 ring-1 ring-amber-500/15 flex items-center justify-center shrink-0">
          <DollarSign className="h-4 w-4 text-amber-600" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-900 leading-none">GH₵ 450K Collected</p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Term 2 · 2025/26</p>
        </div>
      </FloatCard>

      {/* Attendance — bottom-right */}
      <FloatCard delay={0.8} className={`${STAT_CARD} bottom-0 right-[-16px]`} style={STAT_SHADOW}>
        <div className="w-9 h-9 rounded-xl bg-rose-50 ring-1 ring-rose-500/15 flex items-center justify-center shrink-0">
          <Star className="h-4 w-4 text-rose-500 fill-rose-500" />
        </div>
        <div>
          <p className="text-[12px] font-bold text-slate-900 leading-none">94% Attendance</p>
          <p className="text-[11px] text-rose-500 font-semibold mt-1">Best week this term</p>
        </div>
      </FloatCard>
    </div>
  );
}

/* ─── FAQ ─── */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button onClick={() => setOpen(o => !o)} aria-expanded={open}
        className="w-full flex items-center justify-between gap-4 py-5 text-left hover:text-slate-900 transition-colors">
        <span className="text-slate-800 font-semibold text-[15px]">{q}</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }} className="overflow-hidden">
            <div className="pb-5 text-slate-500 text-[14px] leading-relaxed">{a}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── GES TERMINAL REPORT MOCKUP — a printed sheet, not a browser window ─── */
function TerminalReportMockup() {
  const rows = [
    { sub: "Mathematics",    cls: 44, exam: 42, total: 86, grade: "A1", g: "emerald" },
    { sub: "English Lang.",  cls: 40, exam: 39, total: 79, grade: "B2", g: "indigo" },
    { sub: "Int. Science",   cls: 41, exam: 37, total: 78, grade: "B2", g: "indigo" },
    { sub: "Ghanaian Lang.", cls: 38, exam: 36, total: 74, grade: "B3", g: "indigo" },
    { sub: "Social Studies", cls: 36, exam: 35, total: 71, grade: "B3", g: "indigo" },
  ];
  return (
    <div className="w-full h-[340px] overflow-hidden bg-slate-100 flex items-start justify-center">
      <div className="w-[400px] max-w-[92%] bg-white border border-slate-200 rounded-lg shadow-sm px-6 py-5 mt-6">
        <div className="text-center pb-2.5 mb-3" style={{ borderBottom: "3px double #cbd5e1" }}>
          <p className="text-[11px] font-black tracking-wide text-slate-900">ST. MARY&apos;S BASIC SCHOOL</p>
          <p className="text-[8.5px] font-semibold text-slate-500 uppercase tracking-widest mt-0.5">Terminal Report — End of Term 2</p>
        </div>
        <div className="flex justify-between text-[9px] text-slate-600 mb-2.5">
          <span><span className="text-slate-400">Name:</span> <strong>Ama Asante</strong> · Basic 6</span>
          <span><span className="text-slate-400">Position:</span> <strong>2nd of 31</strong></span>
        </div>
        <div className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.7fr] gap-x-2 pb-1 border-b border-slate-200">
          {["Subject", "Class (50)", "Exam (50)", "Total", "Grade"].map(h => (
            <p key={h} className="text-[7.5px] font-bold text-slate-400 uppercase tracking-wide">{h}</p>
          ))}
        </div>
        {rows.map(r => (
          <div key={r.sub} className="grid grid-cols-[1.6fr_1fr_1fr_0.8fr_0.7fr] gap-x-2 items-center py-[5px] border-b border-slate-100 last:border-slate-200">
            <span className="text-[9.5px] font-semibold text-slate-700">{r.sub}</span>
            <span className="text-[9.5px] text-slate-600 tabular-nums">{r.cls}</span>
            <span className="text-[9.5px] text-slate-600 tabular-nums">{r.exam}</span>
            <span className="text-[9.5px] font-bold text-slate-900 tabular-nums">{r.total}</span>
            <span className={`text-[8.5px] font-black px-1.5 py-0.5 rounded w-fit ${r.g === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-indigo-100 text-indigo-700"}`}>{r.grade}</span>
          </div>
        ))}
        <div className="flex justify-between text-[8.5px] text-slate-500 mt-2.5">
          <span>Attendance: <strong className="text-slate-700">58 / 60</strong></span>
          <span>Conduct: <strong className="text-slate-700">Respectful</strong></span>
        </div>
        <p className="text-[9px] text-slate-600 italic mt-2">&ldquo;Hardworking — capable of taking 1st position next term.&rdquo;</p>
        <div className="flex justify-end mt-3">
          <div className="text-center">
            <div className="w-24 border-b border-slate-300 mb-0.5" />
            <p className="text-[7.5px] text-slate-400 uppercase tracking-wide">Class Teacher</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── HOME CONTACT FORM ─── */
function HomeContactForm() {
  const [form, setForm] = useState({ name: "", school: "", phone: "" });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const name = form.name.trim();
  const school = form.school.trim();
  const phone = form.phone.trim();
  const msg = name || school
    ? `Hi Skula! I'm ${name || "(name)"}${school ? ` from ${school}` : ""}. I'd like to set up Skula for my school.${phone ? ` My number: ${phone}` : ""}`
    : "Hi! I'd like to learn more about Skula for my school.";
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`;

  const fields: { key: keyof typeof form; label: string; placeholder: string; type: string }[] = [
    { key: "name",   label: "Your name",       placeholder: "e.g. Kofi Mensah",     type: "text" },
    { key: "school", label: "School name",     placeholder: "e.g. Lincoln Academy", type: "text" },
    { key: "phone",  label: "WhatsApp number", placeholder: "+233 XX XXX XXXX",      type: "tel"  },
  ];

  return (
    <>
      <h3 className="text-[20px] font-black tracking-tight text-slate-900 mb-1">Send us a message</h3>
      <p className="text-slate-500 text-[13px] mb-7">We reply within the hour on WhatsApp.</p>
      <div className="space-y-4">
        {fields.map(({ key, label, placeholder, type }) => (
          <div key={key}>
            <label htmlFor={`home-${key}`} className="block text-[11px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">{label}</label>
            <input id={`home-${key}`} type={type} placeholder={placeholder} value={form[key]} onChange={set(key)}
              className="w-full h-12 rounded-xl border border-slate-200 bg-white px-4 text-[14px] text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all" />
          </div>
        ))}
        <a href={waHref} target="_blank" rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1fba5a] text-white font-bold py-3.5 rounded-xl text-[15px] transition-all mt-2"
          style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.25)" }}>
          <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
        </a>
      </div>
    </>
  );
}

/* ─── MAIN COMPONENT ─── */
export function HomepageClient() {
  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">

      <SkulaNav />

      {/* ── HERO ── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-[60px] pb-10 lg:pb-0"
        style={{ background: "linear-gradient(135deg, #f0f2ff 0%, #f5f3ff 35%, #eef9ff 70%, #f8fafc 100%)" }}>
        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)", backgroundSize: "40px 40px" }} />
        {/* Indigo blob top-left */}
        <div className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)" }} />
        {/* Violet blob right */}
        <div className="absolute top-10 right-[-80px] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)" }} />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-8 w-full py-12 sm:py-20 lg:py-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-8 items-center">

            {/* Left: Copy */}
            <motion.div initial="hidden" animate="show" variants={stagger} className="space-y-7 lg:pr-6">
              <motion.div variants={fadeUp}>
                <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur border border-indigo-100 text-indigo-700 text-[12px] font-semibold px-4 py-1.5 rounded-full"
                  style={{ boxShadow: "0 1px 4px rgba(99,102,241,0.12)" }}>
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  Built for schools across Africa
                </span>
              </motion.div>

              <motion.h1 variants={fadeUp}
                className="text-[40px] sm:text-[56px] lg:text-[60px] xl:text-[68px] font-black leading-[1.05] tracking-[-0.03em] text-slate-900 font-[family-name:var(--font-montserrat)]">
                Everything your school runs on,{" "}
                <span style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                  in one place
                </span>.
              </motion.h1>

              <motion.p variants={fadeUp} className="text-[16px] sm:text-[17px] text-slate-500 leading-relaxed max-w-[480px]">
                Admissions, attendance, fees, exams, payroll and parent communication — built for African schools. Most go live the same day.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 pt-1">
                <Link href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-4 rounded-xl text-[15px] transition-all shadow-lg shadow-indigo-300/40 hover:shadow-indigo-300/60 hover:scale-[1.02] active:scale-[0.98]">
                  Get your school online <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/demo"
                  className="inline-flex items-center justify-center gap-2 bg-white/80 backdrop-blur border-2 border-slate-200 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 font-bold px-7 py-4 rounded-xl text-[15px] transition-all hover:bg-indigo-50/50">
                  <Zap className="h-4 w-4 text-indigo-500" /> Try Live Demo
                </Link>
              </motion.div>

              {/* Honest reassurance row — no fabricated social proof */}
              <motion.ul variants={fadeUp} className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1">
                {["No credit card needed", "Same-day setup", "Cancel anytime"].map((t) => (
                  <li key={t} className="flex items-center gap-1.5 text-[13px] text-slate-500 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    {t}
                  </li>
                ))}
              </motion.ul>

            </motion.div>

            {/* Right: Product composition — desktop */}
            <motion.div
              initial={{ opacity: 0, y: 48 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="relative hidden lg:block">
              <HeroProduct />
            </motion.div>

            {/* Mobile hero image */}
            <motion.div variants={fadeUp} className="lg:hidden flex justify-center -mt-2">
              <img src="/images/hero-1.webp" alt="Student using Skula"
                className="h-56 sm:h-72 object-contain drop-shadow-xl" />
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 pointer-events-none">
          <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="w-full h-16 sm:h-20" fill="white" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z" />
          </svg>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="scroll-mt-20 py-16 md:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-80px" }}
            variants={stagger} className="mb-10 md:mb-16">
            <motion.div variants={fadeUp} className="mb-4">
              <span className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em]">Platform</span>
            </motion.div>
            <motion.h2 variants={fadeUp}
              className="text-[36px] sm:text-[48px] font-black tracking-tight text-slate-900 leading-[1.1] mt-5 font-[family-name:var(--font-montserrat)]">
              Everything your school needs.<br />
              <span className="text-slate-400 font-light italic">Nothing you don't.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[16px] mt-4 max-w-lg leading-relaxed">
              15 modules. One subscription. No per-feature pricing.
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }}
            variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: DollarSign,    color: "#10b981", bg: "#dcfce7", featured: "Most loved",     title: "Fees & Payments",        desc: "Collect fees online or offline. GHS receipts, WhatsApp alerts, defaulter reminders." },
              { icon: Award,         color: "#4f46e5", bg: "#eef2ff", featured: "Built for GES",  title: "GES Continuous Assessment", desc: "SBA the GES way — class work, projects and quizzes weighted with the exam. Class score, exam score and position on a proper GES terminal report sheet." },
              { icon: BookOpen,      color: "#8b5cf6", bg: "#ede9fe", featured: "Time saver",     title: "Exams & Marksheets",     desc: "Enter marks once — Skula auto-ranks, generates BECE-style report cards, ready to print." },
              { icon: ClipboardList, color: "#0ea5e9", bg: "#e0f2fe", featured: "Parents notice", title: "Attendance",             desc: "Daily & subject attendance from any device. Absent alerts to parents via SMS instantly." },
              { icon: Users,         color: "#6366f1", bg: "#eef2ff", title: "Students & Admissions", desc: "Online enrollment, student profiles, BECE tracking, digital ID cards and bulk promotions." },
              { icon: MessageSquare, color: "#ec4899", bg: "#fce7f3", title: "Communication",          desc: "Bulk SMS, email alerts, homework, notice board, internal chat and parent portal." },
              { icon: Banknote,      color: "#059669", bg: "#d1fae5", title: "Payroll",                desc: "Staff salary computation with allowances, deductions, payslips and bulk disbursement." },
              { icon: CalendarDays,  color: "#f59e0b", bg: "#fef3c7", title: "Timetable",              desc: "Build and publish class timetables. Teachers and students see live schedules instantly." },
              { icon: Bus,           color: "#14b8a6", bg: "#ccfbf1", title: "Transport",              desc: "Routes, vehicles, pickup points, student assignment and transport fee management." },
              { icon: Library,       color: "#f97316", bg: "#ffedd5", title: "Library",                desc: "Book catalog, issue & return tracking, overdue alerts and membership management." },
              { icon: Home,          color: "#8b5cf6", bg: "#f3e8ff", title: "Hostel",                 desc: "Boarding house rooms, allocations, room types and hostel fee management." },
              { icon: Smartphone,    color: "#0ea5e9", bg: "#e0f2fe", title: "Online Exams",           desc: "Set MCQ/theory exams. Students attempt online. Auto-grading with instant results." },
              { icon: Building2,     color: "#64748b", bg: "#f1f5f9", title: "Front Office",           desc: "Visitor log, complaints, parent enquiries, dispatch records and reception management." },
              { icon: Globe,         color: "#6366f1", bg: "#eef2ff", title: "Free School Website",     desc: "Every school gets a public, branded website — hero, about, news, staff, events, contact and a one-click parent/student portal login." },
            ].map(({ icon: Icon, color, bg, title, desc, featured }) => (
              <motion.div key={title} variants={fadeUp}
                className="group relative overflow-hidden p-6 rounded-2xl bg-white border hover:shadow-[0_10px_34px_-14px_rgba(15,23,42,0.20)] hover:-translate-y-0.5 transition-all duration-300 cursor-default"
                style={featured
                  ? { borderColor: `${color}3d`, backgroundColor: `${color}08` }
                  : { borderColor: "rgba(15,23,42,0.06)" }}>
                {/* Hairline accent in the module's colour — always lit on featured
                    modules, revealed on hover for the rest */}
                <span className={`absolute inset-x-0 top-0 h-[2px] origin-left transition-transform duration-300 ease-out ${
                  featured ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`}
                  style={{ background: `linear-gradient(90deg, ${color}, ${color}00)` }} />
                {featured && (
                  <span className="absolute top-4 right-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide"
                    style={{ backgroundColor: bg, color }}>
                    <Star className="h-2.5 w-2.5 fill-current" /> {featured}
                  </span>
                )}
                <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 ring-1 transition-transform duration-300 group-hover:scale-105"
                  style={{ backgroundColor: bg, "--tw-ring-color": `${color}22` } as React.CSSProperties}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <h3 className="text-slate-900 font-bold text-[14px] mb-1.5 tracking-tight">{title}</h3>
                <p className="text-slate-500 text-[13px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.12) 0%, transparent 70%)" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-14">
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.14em] mb-4">Getting Started</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[36px] sm:text-[48px] font-black tracking-tight text-white leading-[1.1] font-[family-name:var(--font-montserrat)]">
              Live in 30 minutes.<br /><span className="text-indigo-400">We set it up with you.</span>
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 relative">
            <div className="hidden md:block absolute top-11 left-[calc(33%-16px)] right-[calc(33%-16px)] h-px"
              style={{ background: "linear-gradient(90deg, rgba(99,102,241,0.3), rgba(139,92,246,0.3), rgba(99,102,241,0.3))" }} />
            {[
              { step: "01", icon: UserCheck, title: "Sign up",         desc: "Create your school account. We jump on a 30-minute WhatsApp call and configure everything — classes, sections, fee types, staff accounts.", color: "#6366f1" },
              { step: "02", icon: Users,     title: "Add your school", desc: "Import or add your students and staff. Set up fee structures, timetables and the parent portal. All guided, no technical knowledge needed.", color: "#8b5cf6" },
              { step: "03", icon: Zap,       title: "Go live",         desc: "Start marking attendance, collecting fees with digital receipts, running exams and communicating with parents — all from one dashboard.", color: "#10b981" },
            ].map(({ step, icon: Icon, title, desc, color }) => (
              <motion.div key={step} variants={fadeUp}
                className="group relative p-7 rounded-2xl flex flex-col gap-4 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:bg-white/[0.05]"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                {/* Oversized step number watermark for depth */}
                <span className="pointer-events-none absolute -top-3 right-3 text-[64px] font-black leading-none select-none font-[family-name:var(--font-montserrat)]"
                  style={{ color: color + "16" }}>{step}</span>
                <div className="relative flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105"
                    style={{ background: color + "1f", border: `1px solid ${color}3d`, boxShadow: `0 10px 28px -10px ${color}88` }}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <span className="text-[10px] font-black tracking-widest" style={{ color: color + "99" }}>STEP {step}</span>
                </div>
                <h3 className="relative text-white font-black text-[18px] tracking-tight">{title}</h3>
                <p className="relative text-slate-400 text-[14px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── DASHBOARD SHOWCASE ── */}
      <section id="solutions" className="scroll-mt-20 py-16 md:py-24 bg-white border-t border-slate-900/[0.06]">
        <div className="max-w-6xl mx-auto px-6 space-y-16 md:space-y-28">
          {[
            { eyebrow: "Student Information System",   title: "Every student. Every detail. One place.",      desc: "Enroll students, manage profiles, track BECE candidates, issue ID cards and promote entire classes in minutes — not days.", bullets: ["Bulk enrollment & promotion","BECE candidate management","Digital ID card generation","Parent portal access"], flip: false, accent: "#6366f1", accentBg: "#eef2ff", Mockup: StudentsMockup },
            { eyebrow: "Finance & Fee Management",     title: "Collect fees. Track every pesewa.",             desc: "From setting up fee structures to issuing digital receipts on WhatsApp — Skula automates your entire finance workflow.",    bullets: ["Automated GHS receipts","Defaulter tracking & reminders","Term-by-term fee reports","Multi-currency support"],   flip: true,  accent: "#10b981", accentBg: "#dcfce7", Mockup: FeesMockup    },
            { eyebrow: "Exams & Academic Performance", title: "From marks to report cards automatically.",     desc: "Teachers enter marks once. Skula calculates rankings, generates BECE-style report cards, and makes results available to parents instantly.", bullets: ["Automated grade calculation","Class ranking & reports","BECE-style report cards","Parent result portal"],    flip: false, accent: "#8b5cf6", accentBg: "#ede9fe", Mockup: ExamsMockup   },
            { eyebrow: "GES Continuous Assessment",    title: "SBA done the GES way. Automatically.",          desc: "Teachers capture class work, projects and quizzes through the term; Skula applies the GES weighting and produces the terminal report sheet — class score, exam score, position and remarks.", bullets: ["Weighted SBA components, fully configurable","Class score / exam score split computed for you","Terminal report sheet, print-ready","Attendance, conduct & remarks included"], flip: true, accent: "#4f46e5", accentBg: "#eef2ff", Mockup: TerminalReportMockup },
          ].map(({ eyebrow, title, desc, bullets, flip, accent, accentBg, Mockup }) => (
            <motion.div key={title} initial="hidden" whileInView="show"
              viewport={{ once: true, margin: "-80px" }} variants={stagger}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">
              <div className={flip ? "lg:order-2" : ""}>
                <motion.div variants={fadeUp}>
                  <span className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full mb-5"
                    style={{ backgroundColor: accentBg, color: accent }}>{eyebrow}</span>
                </motion.div>
                <motion.h3 variants={fadeUp}
                  className="text-[30px] sm:text-[38px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5 font-[family-name:var(--font-montserrat)]">
                  {title}
                </motion.h3>
                <motion.p variants={fadeUp} className="text-slate-500 text-[15px] leading-relaxed mb-7">{desc}</motion.p>
                <motion.ul variants={stagger} className="space-y-2.5 mb-8">
                  {bullets.map(b => (
                    <motion.li key={b} variants={fadeUp} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: accentBg }}>
                        <Check className="h-3 w-3" style={{ color: accent }} />
                      </div>
                      <span className="text-slate-700 text-[14px] font-medium">{b}</span>
                    </motion.li>
                  ))}
                </motion.ul>
                <motion.div variants={fadeUp}>
                  <Link href="/demo"
                    className="inline-flex items-center gap-2 font-bold text-[13px] px-5 py-2.5 rounded-xl transition-all hover:gap-3"
                    style={{ backgroundColor: accentBg, color: accent }}>
                    See it live <ChevronRight className="h-4 w-4" />
                  </Link>
                </motion.div>
              </div>
              <motion.div variants={fadeIn} className={flip ? "lg:order-1" : ""}>
                <div className="rounded-2xl overflow-hidden bg-white transition-transform duration-500 ease-out hover:-translate-y-1.5"
                  style={{ boxShadow: `0 0 0 1px rgba(0,0,0,0.05), 0 8px 24px ${accent}15, 0 32px 64px ${accent}10` }}>
                  {/* Mobile scaled */}
                  <div className="lg:hidden overflow-hidden" style={{ height: "calc(340px * 0.62)" }}>
                    <div style={{ transform: "scale(0.62)", transformOrigin: "top left", width: "calc(100% / 0.62)", pointerEvents: "none" }}>
                      <Mockup />
                    </div>
                  </div>
                  {/* Desktop full */}
                  <div className="hidden lg:block">
                    <Mockup />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── INTEGRATIONS ── */}
      <section className="py-16 md:py-24 border-t border-slate-900/[0.06]" style={{ background: "#F8F9FA" }}>
        <div className="max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em] mb-4">Integrations</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[36px] sm:text-[46px] font-black tracking-tight text-slate-900 leading-[1.1] font-[family-name:var(--font-montserrat)]">
              Connected to the tools<br />your school already uses.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[15px] mt-4 max-w-xl mx-auto leading-relaxed">
              Skula plugs into payment gateways, SMS providers and email — no extra setup.
            </motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: CreditCard,    color: "#10b981", bg: "#dcfce7", title: "Online Payment Gateways",    desc: "Accept school fees online via Paystack, Flutterwave and more. Parents pay from their phones — automatic receipt on payment.",              tags: ["Paystack","Flutterwave","Mobile Money"] },
              { icon: MessageSquare, color: "#25D366", bg: "#dcfce7", title: "WhatsApp Receipts & Alerts", desc: "Every fee payment triggers an instant WhatsApp receipt to the parent. Absent students, exam results, notices — all on WhatsApp.",         tags: ["Fee receipts","Attendance alerts","Result notifications"] },
              { icon: Smartphone,    color: "#6366f1", bg: "#eef2ff", title: "SMS Notifications",          desc: "Bulk SMS to parents and staff via your preferred provider. Configure your sender ID, API key — Skula handles the rest.",                   tags: ["Bulk SMS","Custom sender ID","Attendance & fees"] },
              { icon: Mail,          color: "#0ea5e9", bg: "#e0f2fe", title: "Email Notifications",        desc: "Connect your SMTP server or use SendGrid. Send report cards, fee statements, payslips and system alerts via email automatically.",       tags: ["SMTP / SendGrid","Report cards","Payslips & statements"] },
            ].map(({ icon: Icon, color, bg, title, desc, tags }) => (
              <motion.div key={title} variants={fadeUp}
                className="group p-7 rounded-2xl bg-white border border-slate-900/[0.06] hover:border-slate-900/[0.1] hover:shadow-[0_12px_38px_-16px_rgba(15,23,42,0.20)] hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ring-1 transition-transform duration-300 group-hover:scale-105"
                    style={{ backgroundColor: bg, "--tw-ring-color": `${color}22` } as React.CSSProperties}>
                    <Icon className="h-5 w-5" style={{ color }} />
                  </div>
                  <div>
                    <h3 className="text-slate-900 font-black text-[15px] mb-2">{title}</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {tags.map(t => (
                        <span key={t} className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: bg, color }}>{t}</span>
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-slate-500 text-[14px] leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── WHY SKULA ── */}
      <section className="py-16 md:py-24 relative overflow-hidden" style={{ background: "#0a0a0f" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.02) 1px, transparent 0)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)" }} />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-400 uppercase tracking-[0.14em] mb-4">Why Switch</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[36px] sm:text-[48px] font-black tracking-tight text-white leading-[1.1] font-[family-name:var(--font-montserrat)]">
              Traditional management<br />vs <span className="text-indigo-400">Skula</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-400 text-[15px] mt-4">See why modern schools are making the switch.</motion.p>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeIn}>
            <div className="overflow-x-auto rounded-2xl" style={{ boxShadow: "0 0 0 1px rgba(255,255,255,0.05)" }}>
              <div className="min-w-[580px] overflow-hidden rounded-2xl">
                <div className="grid grid-cols-3 border-b border-white/[0.08]" style={{ background: "rgba(255,255,255,0.03)" }}>
                  <div className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase tracking-widest">Capability</div>
                  <div className="px-6 py-4 text-[11px] font-bold text-rose-400/70 uppercase tracking-widest text-center border-l border-white/[0.06]">Traditional</div>
                  <div className="px-6 py-4 text-[11px] font-bold text-indigo-400 uppercase tracking-widest text-center border-l border-indigo-500/20" style={{ background: "rgba(99,102,241,0.07)" }}>Skula ✦</div>
                </div>
                {[
                  ["Fee Collection","Manual receipts, cash only","Digital receipts + WhatsApp alerts"],
                  ["Attendance","Paper registers, easily lost","Digital, real-time, parent SMS"],
                  ["Report Cards","Typed in Word, error-prone","Auto-generated from marks, print-ready"],
                  ["Communication","WhatsApp groups, chaotic","Structured channels, bulk SMS, portal"],
                  ["Analytics","None — end of term only","Live dashboards, trend analysis"],
                  ["Access","Office only, office hours","Any device, anywhere, 24/7"],
                  ["Data Safety","Physical files, fire risk","Cloud-hosted, encrypted, backed up"],
                ].map(([cap,trad,skula]) => (
                  <div key={cap} className="group grid grid-cols-3 border-b border-white/[0.04] last:border-0 hover:bg-white/[0.03] transition-colors">
                    <div className="px-6 py-4 text-[13px] font-semibold text-slate-300">{cap}</div>
                    <div className="px-6 py-4 text-[13px] text-rose-400/70 border-l border-white/[0.04] flex items-start gap-2">
                      <Minus className="h-3.5 w-3.5 mt-0.5 shrink-0 text-rose-500/60" />{trad}
                    </div>
                    <div className="px-6 py-4 text-[13px] text-indigo-200 font-medium border-l border-indigo-500/20 flex items-start gap-2 transition-colors group-hover:bg-indigo-500/[0.12]" style={{ background: "rgba(99,102,241,0.08)" }}>
                      <Check className="h-3.5 w-3.5 mt-0.5 shrink-0 text-indigo-300" />{skula}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section className="py-16 md:py-24 bg-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
        <div className="absolute -top-24 -left-24 w-[400px] h-[400px] bg-indigo-500/30 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-[400px] h-[400px] bg-violet-600/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-2 md:grid-cols-4">
            {[
              { n: "15+",  l: "Modules",        icon: GraduationCap },
              { n: "7",    l: "User roles",     icon: Users },
              { n: "24/7", l: "Cloud access",   icon: Shield },
              { n: "Same day", l: "To go live", icon: Clock },
            ].map(({ n, l, icon: Icon }, i) => (
              <motion.div key={l} variants={fadeUp}
                className={`group text-center py-10 px-4 border-white/15 ${
                  i === 0 ? "border-r border-b md:border-b-0" :
                  i === 1 ? "md:border-r border-b md:border-b-0" :
                  i === 2 ? "border-r" : ""
                }`}>
                <div className="w-11 h-11 mx-auto mb-4 rounded-xl bg-white/10 ring-1 ring-white/15 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:bg-white/20">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <p className="text-4xl sm:text-5xl font-black text-white mb-1.5 tracking-tight">{n}</p>
                <p className="text-indigo-200 text-[13px] font-medium">{l}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials intentionally omitted until we have real, attributable customer quotes. */}

      {/* ── PRICING ── */}
      <section id="pricing" className="scroll-mt-20 py-16 md:py-24 bg-white border-t border-slate-900/[0.06]">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em] mb-4">Pricing</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[40px] sm:text-[48px] font-black tracking-tight text-slate-900 font-[family-name:var(--font-montserrat)]">
              Simple, transparent pricing.
            </motion.h2>
            <motion.p variants={fadeUp} className="text-slate-500 text-[15px] mt-4">
              Every plan includes all 15 modules and a free school website. Save 2 months when you pay annually.
            </motion.p>
            <motion.p variants={fadeUp} className="text-[13px] text-slate-400 mt-3">
              Just exploring? <Link href="/demo" className="text-indigo-600 font-semibold hover:underline">Try the live demo free →</Link>
            </motion.p>
          </motion.div>

          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start max-w-5xl mx-auto">
            {[
              { name: "Monthly",    price: "GH₵199",   sub: "per month, billed monthly", annual: "", hl: false, cta: "Get started →", href: "/contact", features: ["All 15 modules","Free school website","Unlimited students","WhatsApp & SMS alerts","Online fee payments","Custom domain","Daily backups & analytics","Priority support"] },
              { name: "Annual",     price: "GH₵1,990", sub: "per year, billed annually", annual: "Save 17% — 2 months free", hl: true, cta: "Get started →", href: "/contact", features: ["All 15 modules","Free school website","Unlimited students","WhatsApp & SMS alerts","Online fee payments","Custom domain","Daily backups & analytics","Priority support"] },
              { name: "Enterprise", price: "Custom",   sub: "for school groups & large institutions", annual: "", hl: false, cta: "Contact sales", href: "/contact", features: ["Everything in Annual","Dedicated infrastructure","Enhanced SLA & uptime","On-site training","Custom integrations","Dedicated account manager"] },
            ].map(({ name, price, sub, annual, hl, features, cta, href }) => (
              <motion.div key={name} variants={fadeUp}
                className={`group rounded-2xl p-6 border relative flex flex-col transition-all duration-300 ${hl
                  ? "border-slate-900/[0.0] lg:scale-[1.03] z-10 hover:-translate-y-1"
                  : "bg-white border-slate-900/[0.07] hover:-translate-y-1 hover:border-slate-900/[0.12] hover:shadow-[0_16px_44px_-18px_rgba(15,23,42,0.22)]"
                }`}
                style={hl ? {
                  background: "#0a0a0f",
                  boxShadow: "0 0 0 1px rgba(99,102,241,0.3), 0 8px 32px rgba(99,102,241,0.15)",
                } : { boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
                {hl && (
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-40 rounded-t-2xl"
                    style={{ background: "radial-gradient(120% 100% at 50% 0%, rgba(99,102,241,0.22) 0%, transparent 70%)" }} />
                )}
                {hl && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[10px] font-black px-5 py-1.5 rounded-full whitespace-nowrap z-10"
                    style={{ boxShadow: "0 4px 16px rgba(99,102,241,0.4)" }}>
                    ✦ BEST VALUE
                  </div>
                )}
                <div className="mb-6">
                  <p className={`text-[10px] font-bold uppercase tracking-widest mb-3 ${hl ? "text-indigo-400" : "text-slate-400"}`}>{name}</p>
                  <p className={`text-[34px] font-black leading-none mb-2 ${hl ? "text-white" : "text-slate-900"}`}>{price}</p>
                  <p className="text-[12px] text-slate-400">{sub}</p>
                  {annual && (
                    <p className={`text-[12.5px] font-semibold mt-2 ${hl ? "text-emerald-400" : "text-emerald-600"}`}>{annual}</p>
                  )}
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {features.map(f => (
                    <li key={f} className={`flex items-center gap-3 text-[13px] ${hl ? "text-slate-300" : "text-slate-600"}`}>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${hl ? "bg-indigo-500/20" : "bg-slate-100"}`}>
                        <Check className={`h-3 w-3 ${hl ? "text-indigo-400" : "text-slate-600"}`} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link href={href}
                  className={`block text-center py-3.5 rounded-xl font-bold text-[14px] transition-all ${hl
                    ? "bg-indigo-600 hover:bg-indigo-500 text-white"
                    : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                  style={hl ? { boxShadow: "0 4px 16px rgba(99,102,241,0.35)" } : {}}>
                  {cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>

          <motion.p variants={fadeUp} className="text-center text-[12px] text-slate-400 mt-6">
            Prices in GH₵, exclusive of taxes. Launch pricing — <Link href="/terms" className="text-slate-500 hover:text-indigo-600 underline underline-offset-2">terms &amp; conditions apply</Link>.
          </motion.p>

          {/* Add-on — Multi Branch (prominent band) */}
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={fadeUp}
            className="mt-12 relative overflow-hidden rounded-3xl px-7 py-8 sm:px-10 sm:py-9"
            style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 55%, #6366f1 100%)" }}>
            <div className="absolute -top-16 -right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-10 w-64 h-64 bg-violet-300/15 rounded-full blur-3xl pointer-events-none" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 backdrop-blur flex items-center justify-center shrink-0">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div className="flex-1">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 text-white text-[10.5px] font-bold uppercase tracking-[0.16em] px-2.5 py-1 rounded-full mb-3">
                  <Zap className="h-3 w-3" /> Add-on
                </span>
                <h3 className="text-[23px] sm:text-[27px] font-black text-white tracking-tight leading-tight font-[family-name:var(--font-montserrat)]">
                  Running more than one campus?
                </h3>
                <p className="text-indigo-100 text-[14px] sm:text-[15px] mt-2 max-w-2xl leading-relaxed">
                  <span className="font-bold text-white">Multi Branch</span> lets each branch run on its own — students, staff,
                  fees and attendance — while head office sees every branch separately <em>and</em> combined in one view.
                  Optional add-on on any paid plan.
                </p>
              </div>
              <Link href="/contact"
                className="shrink-0 inline-flex items-center justify-center gap-2 bg-white text-indigo-700 hover:bg-indigo-50 px-6 py-3.5 rounded-xl text-[14px] font-bold transition-all hover:scale-[1.03] active:scale-[0.98] shadow-lg shadow-indigo-900/25">
                Ask about add-ons <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="scroll-mt-20 py-16 md:py-24 border-t border-slate-900/[0.06]" style={{ background: "#F8F9FA" }}>
        <div className="max-w-3xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="text-center mb-12">
            <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em] mb-4">FAQ</motion.p>
            <motion.h2 variants={fadeUp}
              className="text-[40px] font-black tracking-tight text-slate-900 font-[family-name:var(--font-montserrat)]">
              Frequently asked questions.
            </motion.h2>
          </motion.div>
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="bg-white rounded-2xl border border-slate-900/[0.06] px-6"
            style={{ boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
            {[
              { q: "How long does it take to set up?",           a: "Most schools are fully live in under 30 minutes. We join a WhatsApp call with you and configure classes, fee types, sections and staff accounts together." },
              { q: "Can parents pay school fees online?",         a: "Yes. Skula integrates with Paystack, Flutterwave and mobile money. Parents pay from their phone and receive an instant WhatsApp receipt. No cash needed." },
              { q: "Which payment gateways are supported?",       a: "Paystack, Flutterwave and mobile money are supported out of the box. You configure your own API keys in Settings — Skula handles the rest including receipt generation." },
              { q: "Does it send SMS and email notifications?",   a: "Yes. Connect your SMS provider (with your own sender ID) and SMTP email server. Skula sends attendance alerts, fee reminders, results and announcements automatically." },
              { q: "Can multiple staff use it simultaneously?",   a: "Yes. Each staff member gets their own login with role-based access — accountant sees fees, teacher sees classes, admin sees everything — all at the same time." },
              { q: "Is my school data kept private?",             a: "Completely. Every school runs in a fully isolated database. No other institution can ever access your students, fees, or records." },
              { q: "Does it work for Basic, JHS and SHS?",        a: "Yes. Skula supports all levels — Basic, JHS and SHS — including BECE candidate tracking, JHS grading scales, and term-based academic calendars." },
              { q: "Do we need to install anything?",             a: "No. Skula runs in any web browser on phone, tablet or computer — nothing to install, no servers to maintain. We host, secure and back up everything for you." },
            ].map(({ q, a }) => (
              <motion.div key={q} variants={fadeUp}>
                <FaqItem q={q} a={a} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section className="py-16 md:py-24 bg-white border-t border-slate-900/[0.06]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
              <motion.p variants={fadeUp} className="text-[11px] font-bold text-indigo-600 uppercase tracking-[0.14em] mb-4">Get in Touch</motion.p>
              <motion.h2 variants={fadeUp}
                className="text-[32px] sm:text-[44px] font-black tracking-tight text-slate-900 leading-[1.1] mb-5 font-[family-name:var(--font-montserrat)]">
                Ready to transform<br />your school?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-500 text-[15px] leading-relaxed mb-10">
                Chat with us on WhatsApp and we'll have your school live today.
              </motion.p>
              <motion.div variants={stagger} className="space-y-3">
                {[
                  { icon: MessageSquare, label: "WhatsApp", val: "+233 595 111 461", color: "#25D366" },
                  { icon: Globe,         label: "Website",  val: "getskula.com",     color: "#6366f1" },
                  { icon: Lock,          label: "Data",     val: "Global · EU-compliant", color: "#8b5cf6" },
                ].map(({ icon: Icon, label, val, color }) => (
                  <motion.div key={label} variants={fadeUp}
                    className="flex items-center gap-4 p-4 rounded-2xl border border-slate-900/[0.06] bg-white"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color + "12" }}>
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
              className="bg-white rounded-2xl border border-slate-900/[0.07] p-8"
              style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.06)" }}>
              <HomeContactForm />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-16 md:py-20" style={{ background: "#F8F9FA" }}>
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}
            className="relative rounded-3xl overflow-hidden text-center px-8 py-20"
            style={{ background: "#0a0a0f" }}>
            <div className="absolute inset-0 pointer-events-none"
              style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)", backgroundSize: "28px 28px" }} />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none"
              style={{ background: "radial-gradient(ellipse, rgba(99,102,241,0.18) 0%, transparent 65%)" }} />
            <div className="relative">
              <motion.div variants={fadeUp}
                className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur text-white text-[11px] font-semibold px-5 py-2 rounded-full border border-white/[0.08] mb-8">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Live in 30 minutes — guaranteed
              </motion.div>
              <motion.h2 variants={fadeUp}
                className="text-[34px] sm:text-[52px] font-black text-white leading-[1.05] tracking-tight mb-5 font-[family-name:var(--font-montserrat)]">
                Your school deserves<br />a system that works.
              </motion.h2>
              <motion.p variants={fadeUp} className="text-slate-400 text-[16px] mb-10 max-w-md mx-auto leading-relaxed">
                Try the live demo — no sign-up. Or WhatsApp us and we'll have your school live before the day ends.
              </motion.p>
              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/demo"
                  className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-slate-100 text-slate-900 px-8 py-4 rounded-2xl font-black text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
                  Try Demo Free <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
                <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1fba5a] text-white px-8 py-4 rounded-2xl font-black text-[15px] transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ boxShadow: "0 4px 16px rgba(37,211,102,0.3)" }}>
                  <WhatsAppIcon className="h-5 w-5" /> WhatsApp Us
                </a>
              </motion.div>
              <motion.p variants={fadeUp} className="text-white/55 text-[12px] mt-7">
All 15 modules + a free school website · GH₵199/mo or GH₵1,990/yr · Cancel anytime
              </motion.p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-white/[0.06]" style={{ background: "#080810" }}>
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-14">
            <div className="col-span-2">
              <div className="mb-4">
                <div className="inline-block bg-white rounded-xl px-3 py-2">
                  <img src="/images/skula-logomark.png" alt="Skula" className="h-8 object-contain" />
                </div>
              </div>
              <p className="text-[13px] leading-relaxed max-w-[210px] text-slate-400 mb-6">
                The all-in-one school management platform, built for African schools.
              </p>
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#4ade80] text-[12px] font-semibold px-4 py-2 rounded-xl transition-colors border border-[#25D366]/20 hover:border-[#25D366]/40 bg-[#25D366]/[0.07] hover:bg-[#25D366]/[0.12]">
                <WhatsAppIcon className="h-3.5 w-3.5" /> Chat on WhatsApp
              </a>
            </div>
            {[
              { title: "Product",     links: [["Features","#features"],["Pricing","#pricing"],["All features","/features"],["Sign in","/sign-in"]] },
              { title: "Get started", links: [["Live demo","/demo"],["Get started","/contact"],["WhatsApp us",WHATSAPP_URL]] },
              { title: "Company",     links: [["Contact","/contact"],["Terms","/terms"],["Privacy","/privacy"],["Novalss","https://novalss.com"]] },
            ].map(({ title, links }) => (
              <div key={title}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400 mb-5">{title}</p>
                <div className="flex flex-col gap-3">
                  {links.map(([l,h]) => (
                    <a key={l} href={h} target={h.startsWith("https") ? "_blank" : undefined} rel="noopener noreferrer"
                      className="text-[13px] text-slate-400 hover:text-white transition-colors w-fit">{l}</a>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-white/[0.05] pt-7 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-[12px] text-slate-500">© {new Date().getFullYear()} Novalss Technology Solutions. All rights reserved.</p>
            <p className="text-[12px] text-slate-500">Made with ♥ for African schools</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
