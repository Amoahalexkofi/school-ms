"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, DollarSign,
  GraduationCap, LogOut, Menu, X, TrendingUp, UserCog, Calendar,
  FileText, BarChart2, Banknote, Library, Bus, Building, Package,
  ConciergeBell, Monitor, UserPlus, ShieldCheck, Settings, ScrollText,
  Megaphone, Send, MessageCircle, Layers, Home, CreditCard, CheckSquare,
  Bell, User, ChevronRight,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

type NavItem = { href: string; label: string; icon: React.ElementType };
type NavGroup = { label: string; items: NavItem[] };

const adminGroups: NavGroup[] = [
  {
    label: "Overview",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/students",   label: "Students",   icon: Users },
      { href: "/staff",      label: "Staff",       icon: UserCog },
      { href: "/admissions", label: "Admissions",  icon: UserPlus },
      { href: "/alumni",     label: "Alumni",      icon: GraduationCap },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/attendance",    label: "Attendance",     icon: ClipboardList },
      { href: "/exam-groups",   label: "Exams & Marks",  icon: BookOpen },
      { href: "/results",       label: "Results",        icon: TrendingUp },
      { href: "/timetable",     label: "Timetable",      icon: Calendar },
      { href: "/homework",      label: "Homework",       icon: FileText },
      { href: "/lesson-plans",  label: "Lesson Plans",   icon: ScrollText },
      { href: "/subject-groups",label: "Subject Groups", icon: Layers },
      { href: "/online-exams",  label: "Online Exams",   icon: Monitor },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/fees",    label: "Fees",    icon: DollarSign },
      { href: "/finance", label: "Finance", icon: Banknote },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/library",     label: "Library",     icon: Library },
      { href: "/transport",   label: "Transport",   icon: Bus },
      { href: "/hostel",      label: "Hostel",      icon: Building },
      { href: "/inventory",   label: "Inventory",   icon: Package },
      { href: "/front-office",label: "Front Office",icon: ConciergeBell },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notice-board", label: "Notice Board", icon: Megaphone },
      { href: "/messaging",    label: "Messaging",    icon: Send },
      { href: "/chat",         label: "Chat",         icon: MessageCircle },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/reports",   label: "Reports",   icon: BarChart2 },
      { href: "/audit-log", label: "Audit Log", icon: ShieldCheck },
      { href: "/settings",  label: "Settings",  icon: Settings },
    ],
  },
];

const studentGroups: NavGroup[] = [
  {
    label: "My School",
    items: [
      { href: "/dashboard",     label: "Dashboard",   icon: Home },
      { href: "/my-results",    label: "My Results",  icon: TrendingUp },
      { href: "/my-attendance", label: "Attendance",  icon: ClipboardList },
      { href: "/my-fees",       label: "My Fees",     icon: CreditCard },
      { href: "/my-homework",   label: "Homework",    icon: CheckSquare },
      { href: "/timetable",     label: "Timetable",   icon: Calendar },
      { href: "/online-exams",  label: "Online Exams",icon: Monitor },
      { href: "/notice-board",  label: "Notices",     icon: Bell },
      { href: "/chat",          label: "Chat",        icon: MessageCircle },
    ],
  },
];

const parentGroups: NavGroup[] = [
  {
    label: "My Child",
    items: [
      { href: "/dashboard",         label: "Dashboard",    icon: Home },
      { href: "/parent/results",    label: "Results",      icon: TrendingUp },
      { href: "/parent/attendance", label: "Attendance",   icon: ClipboardList },
      { href: "/parent/fees",       label: "Fee Statement",icon: CreditCard },
      { href: "/parent/homework",   label: "Homework",     icon: CheckSquare },
      { href: "/timetable",         label: "Timetable",    icon: Calendar },
      { href: "/notice-board",      label: "Notices",      icon: Bell },
      { href: "/chat",              label: "Chat",         icon: MessageCircle },
    ],
  },
];

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "STUDENT" | "PARENT" | string;

function getGroups(role: Role): NavGroup[] {
  if (role === "STUDENT") return studentGroups;
  if (role === "PARENT")  return parentGroups;
  return adminGroups;
}

function getPortalLabel(role: Role) {
  if (role === "STUDENT") return "Student Portal";
  if (role === "PARENT")  return "Parent Portal";
  return null;
}

function NavContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const groups = getGroups(role);
  const portalLabel = getPortalLabel(role);
  const userName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail = session?.user?.email ?? "";
  const initials = userName.slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <div>
            <span className="text-white font-bold text-base tracking-tight">Skula</span>
            {portalLabel && (
              <span className="block text-[10px] text-slate-400 leading-none mt-0.5">{portalLabel}</span>
            )}
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto px-3 pb-3 scrollbar-none">
        {groups.map((group) => (
          <div key={group.label} className="mb-1">
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500 select-none">
              {group.label}
            </p>
            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                    active
                      ? "bg-white/10 text-white"
                      : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                  )}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-blue-400 rounded-r-full" />
                  )}
                  <Icon className={cn("h-4 w-4 shrink-0 transition-colors", active ? "text-blue-400" : "text-slate-500 group-hover:text-slate-300")} />
                  <span className="truncate">{label}</span>
                  {active && <ChevronRight className="h-3 w-3 ml-auto text-slate-500" />}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* User + Sign Out */}
      <div className="shrink-0 p-3 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-slate-200 truncate">{userName}</p>
            <p className="text-[10px] text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/sign-in" })}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-colors"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

export function Sidebar({ role = "ADMIN" }: { role?: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <GraduationCap className="h-4 w-4 text-white" />
          </div>
          <span className="text-white font-bold text-sm">Skula</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-slate-900 flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <NavContent role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-slate-900 min-h-screen border-r border-slate-800/50">
        <NavContent role={role} />
      </aside>
    </>
  );
}
