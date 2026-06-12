"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, DollarSign,
  GraduationCap, LogOut, Menu, X, TrendingUp, UserCog, Calendar,
  FileText, BarChart2, Banknote, Library, Bus, Building, Package,
  ConciergeBell, Monitor, UserPlus, ShieldCheck, Settings, ScrollText,
  Megaphone, Send, MessageCircle, Layers, Home, CreditCard, CheckSquare,
  Bell, User,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const adminNav = [
  { href: "/dashboard",     label: "Dashboard",      icon: LayoutDashboard },
  { href: "/students",      label: "Students",        icon: Users },
  { href: "/attendance",    label: "Attendance",      icon: ClipboardList },
  { href: "/exam-groups",   label: "Exams & Marks",   icon: BookOpen },
  { href: "/results",       label: "Results",         icon: TrendingUp },
  { href: "/fees",          label: "Fees",            icon: DollarSign },
  { href: "/staff",         label: "Staff",           icon: UserCog },
  { href: "/subject-groups",label: "Subject Groups",  icon: Layers },
  { href: "/timetable",     label: "Timetable",       icon: Calendar },
  { href: "/homework",      label: "Homework",        icon: FileText },
  { href: "/finance",       label: "Finance",         icon: Banknote },
  { href: "/library",       label: "Library",         icon: Library },
  { href: "/transport",     label: "Transport",       icon: Bus },
  { href: "/hostel",        label: "Hostel",          icon: Building },
  { href: "/inventory",     label: "Inventory",       icon: Package },
  { href: "/front-office",  label: "Front Office",    icon: ConciergeBell },
  { href: "/alumni",        label: "Alumni",          icon: GraduationCap },
  { href: "/online-exams",  label: "Online Exams",    icon: Monitor },
  { href: "/admissions",    label: "Admissions",      icon: UserPlus },
  { href: "/audit-log",     label: "Audit Log",       icon: ShieldCheck },
  { href: "/lesson-plans",  label: "Lesson Plans",    icon: ScrollText },
  { href: "/notice-board",  label: "Notice Board",    icon: Megaphone },
  { href: "/messaging",     label: "Messaging",       icon: Send },
  { href: "/chat",          label: "Chat",            icon: MessageCircle },
  { href: "/settings",      label: "Settings",        icon: Settings },
  { href: "/reports",       label: "Reports",         icon: BarChart2 },
];

const studentNav = [
  { href: "/dashboard",      label: "Dashboard",    icon: Home },
  { href: "/my-results",     label: "My Results",   icon: TrendingUp },
  { href: "/my-attendance",  label: "Attendance",   icon: ClipboardList },
  { href: "/my-fees",        label: "My Fees",      icon: CreditCard },
  { href: "/my-homework",    label: "Homework",     icon: CheckSquare },
  { href: "/timetable",      label: "Timetable",    icon: Calendar },
  { href: "/online-exams",   label: "Online Exams", icon: Monitor },
  { href: "/notice-board",   label: "Notices",      icon: Bell },
  { href: "/chat",           label: "Chat",         icon: MessageCircle },
];

const parentNav = [
  { href: "/dashboard",         label: "Dashboard",   icon: Home },
  { href: "/parent/results",    label: "Results",     icon: TrendingUp },
  { href: "/parent/attendance", label: "Attendance",  icon: ClipboardList },
  { href: "/parent/fees",       label: "Fee Statement",icon: CreditCard },
  { href: "/parent/homework",   label: "Homework",    icon: CheckSquare },
  { href: "/timetable",         label: "Timetable",   icon: Calendar },
  { href: "/notice-board",      label: "Notices",     icon: Bell },
  { href: "/chat",              label: "Chat",        icon: MessageCircle },
];

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "STUDENT" | "PARENT" | string;

function getNav(role: Role) {
  if (role === "STUDENT") return studentNav;
  if (role === "PARENT")  return parentNav;
  return adminNav;
}

function getRoleLabel(role: Role) {
  if (role === "STUDENT") return { label: "Student Portal", color: "text-blue-600" };
  if (role === "PARENT")  return { label: "Parent Portal",  color: "text-violet-600" };
  return { label: "Skola", color: "text-blue-600" };
}

export function Sidebar({ role = "ADMIN" }: { role?: Role }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = getNav(role);
  const { label, color } = getRoleLabel(role);

  const nav = (
    <nav className="flex flex-col gap-0.5 p-3">
      {items.map(({ href, label: lbl, icon: Icon }) => {
        const active =
          href === "/dashboard" ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            )}
          >
            <Icon className="h-4 w-4 shrink-0" />
            {lbl}
          </Link>
        );
      })}
    </nav>
  );

  const brand = (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
        {role === "STUDENT" ? <User className="h-4 w-4 text-white" /> :
         role === "PARENT"  ? <Users className="h-4 w-4 text-white" /> :
         <GraduationCap className="h-4 w-4 text-white" />}
      </div>
      <span className={cn("font-bold text-gray-900 text-sm", color)}>{label}</span>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        {brand}
        <button onClick={() => setOpen(!open)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-white flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-5 py-4 border-b shrink-0">{brand}</div>
            <div className="flex-1 overflow-y-auto">{nav}</div>
            <div className="p-3 border-t">
              <button
                onClick={() => signOut({ callbackUrl: "/sign-in" })}
                className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r min-h-screen">
        <div className="flex items-center gap-2 px-5 py-5 border-b">{brand}</div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="p-3 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
