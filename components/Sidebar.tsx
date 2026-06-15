"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, DollarSign,
  GraduationCap, LogOut, Menu, X, TrendingUp, UserCog, Calendar,
  FileText, BarChart2, Banknote, Library, Bus, Building, Package,
  ConciergeBell, Monitor, UserPlus, ShieldCheck, Settings, ScrollText,
  Megaphone, Send, MessageCircle, Layers, Home, CreditCard, CheckSquare,
  Bell, ChevronDown,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

type NavItem  = { href: string; label: string; icon: React.ElementType };
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
      { href: "/attendance",     label: "Attendance",    icon: ClipboardList },
      { href: "/exam-groups",    label: "Exams & Marks", icon: BookOpen },
      { href: "/results",        label: "Results",       icon: TrendingUp },
      { href: "/timetable",      label: "Timetable",     icon: Calendar },
      { href: "/homework",       label: "Homework",      icon: FileText },
      { href: "/lesson-plans",   label: "Lesson Plans",  icon: ScrollText },
      { href: "/subject-groups", label: "Subjects",      icon: Layers },
      { href: "/online-exams",   label: "Online Exams",  icon: Monitor },
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
      { href: "/library",      label: "Library",      icon: Library },
      { href: "/transport",    label: "Transport",    icon: Bus },
      { href: "/hostel",       label: "Hostel",       icon: Building },
      { href: "/inventory",    label: "Inventory",    icon: Package },
      { href: "/front-office", label: "Front Office", icon: ConciergeBell },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notice-board", label: "Notices",   icon: Megaphone },
      { href: "/messaging",    label: "Messaging", icon: Send },
      { href: "/chat",         label: "Chat",      icon: MessageCircle },
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
      { href: "/dashboard",     label: "Dashboard",    icon: Home },
      { href: "/my-results",    label: "My Results",   icon: TrendingUp },
      { href: "/my-attendance", label: "Attendance",   icon: ClipboardList },
      { href: "/my-fees",       label: "My Fees",      icon: CreditCard },
      { href: "/my-homework",   label: "Homework",     icon: CheckSquare },
      { href: "/timetable",     label: "Timetable",    icon: Calendar },
      { href: "/online-exams",  label: "Online Exams", icon: Monitor },
      { href: "/notice-board",  label: "Notices",      icon: Bell },
      { href: "/chat",          label: "Chat",         icon: MessageCircle },
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
      { href: "/parent/fees",       label: "Fee Statement", icon: CreditCard },
      { href: "/parent/homework",   label: "Homework",     icon: CheckSquare },
      { href: "/timetable",         label: "Timetable",    icon: Calendar },
      { href: "/notice-board",      label: "Notices",      icon: Bell },
      { href: "/chat",              label: "Chat",         icon: MessageCircle },
    ],
  },
];

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "STUDENT" | "PARENT" | string;

function getGroups(role: Role): NavGroup[]  { return role === "STUDENT" ? studentGroups : role === "PARENT" ? parentGroups : adminGroups; }
function getPortalLabel(role: Role)         { return role === "STUDENT" ? "Student" : role === "PARENT" ? "Parent" : null; }

function NavContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const [showUser, setShowUser] = useState(false);

  const groups      = getGroups(role);
  const portalLabel = getPortalLabel(role);
  const userName    = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail   = session?.user?.email ?? "";
  const userRole    = ((session?.user as any)?.role ?? role ?? "").replace(/_/g, " ").toLowerCase();
  const initials    = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-slate-100 shrink-0">
        <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
          <GraduationCap className="h-3.5 w-3.5 text-white" />
        </div>
        <span className="font-bold text-slate-900 text-[15px] tracking-tight">Skula</span>
        {portalLabel && (
          <span className="ml-auto text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md border border-indigo-100">
            {portalLabel}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {groups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-4")}>

            <p className="px-2.5 mb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-[0.08em] select-none">
              {group.label}
            </p>

            {group.items.map(({ href, label, icon: Icon }) => {
              const active = href === "/dashboard"
                ? pathname === href
                : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-2.5 h-8 px-2.5 rounded-md text-[13px] font-medium transition-colors duration-100 group",
                    active
                      ? "bg-indigo-50 text-indigo-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                  )}
                >
                  <Icon className={cn(
                    "h-[15px] w-[15px] shrink-0 transition-colors",
                    active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600"
                  )} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 px-2 pb-3 pt-2 border-t border-slate-100">
        <button
          onClick={() => setShowUser(s => !s)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-slate-50 transition-colors text-left group"
        >
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-slate-700 truncate leading-none">{userName}</p>
            <p className="text-[10px] text-slate-400 truncate mt-0.5 capitalize">{userRole}</p>
          </div>
          <ChevronDown className={cn(
            "h-3 w-3 text-slate-300 shrink-0 transition-transform duration-150",
            showUser && "rotate-180"
          )} />
        </button>

        {showUser && (
          <div className="mt-1 mx-0.5 rounded-lg border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="px-3 py-2 border-b border-slate-50">
              <p className="text-[11px] text-slate-400 truncate">{userEmail}</p>
            </div>
            <Link
              href="/settings/school-profile"
              onClick={() => setShowUser(false)}
              className="flex items-center gap-2 px-3 py-2 text-[12px] text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-400" /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full flex items-center gap-2 px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function Sidebar({ role = "ADMIN" }: { role?: Role }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-white border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 bg-indigo-600 rounded-md flex items-center justify-center">
            <GraduationCap className="h-3 w-3 text-white" />
          </div>
          <span className="font-bold text-slate-900 text-sm">Skula</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-60 h-full bg-white border-r border-slate-100 shadow-xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <NavContent role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-white border-r border-slate-100 min-h-screen">
        <NavContent role={role} />
      </aside>
    </>
  );
}
