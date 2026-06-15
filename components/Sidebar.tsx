"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, DollarSign,
  GraduationCap, LogOut, Menu, X, TrendingUp, UserCog, Calendar,
  FileText, BarChart2, Banknote, Library, Bus, Building, Package,
  ConciergeBell, Monitor, UserPlus, ShieldCheck, Settings, ScrollText,
  Megaphone, Send, MessageCircle, Layers, Home, CreditCard, CheckSquare,
  Bell, ChevronRight,
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
      { href: "/students",   label: "Students",    icon: Users },
      { href: "/staff",      label: "Staff",        icon: UserCog },
      { href: "/admissions", label: "Admissions",   icon: UserPlus },
      { href: "/alumni",     label: "Alumni",       icon: GraduationCap },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/attendance",     label: "Attendance",   icon: ClipboardList },
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
      { href: "/dashboard",         label: "Dashboard",     icon: Home },
      { href: "/parent/results",    label: "Results",       icon: TrendingUp },
      { href: "/parent/attendance", label: "Attendance",    icon: ClipboardList },
      { href: "/parent/fees",       label: "Fee Statement", icon: CreditCard },
      { href: "/parent/homework",   label: "Homework",      icon: CheckSquare },
      { href: "/timetable",         label: "Timetable",     icon: Calendar },
      { href: "/notice-board",      label: "Notices",       icon: Bell },
      { href: "/chat",              label: "Chat",          icon: MessageCircle },
    ],
  },
];

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "STUDENT" | "PARENT" | string;

function getGroups(role: Role): NavGroup[] {
  return role === "STUDENT" ? studentGroups : role === "PARENT" ? parentGroups : adminGroups;
}

function NavContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showSignOut, setShowSignOut] = useState(false);

  const groups   = getGroups(role);
  const userName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const userRole = ((session?.user as any)?.role ?? role ?? "").replace(/_/g, " ");
  const initials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-[#0d0e14]">

      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-[15px] tracking-tight">Skula</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 scrollbar-none">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 mb-1.5 text-[10px] font-semibold text-white/20 uppercase tracking-[0.08em] select-none">
              {group.label}
            </p>
            <div className="space-y-0.5">
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
                      "flex items-center gap-2.5 px-2.5 py-[7px] rounded-md text-[13px] font-medium transition-all duration-100",
                      active
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"
                    )}
                  >
                    <Icon className={cn(
                      "h-[15px] w-[15px] shrink-0",
                      active ? "text-emerald-400" : "text-white/25"
                    )} />
                    <span className="truncate">{label}</span>
                    {active && <ChevronRight className="h-3 w-3 ml-auto text-emerald-500/50 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 px-3 py-3 border-t border-white/[0.06]">
        <div className="flex items-center gap-2.5 px-2 py-2 rounded-md group">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-[11px] font-bold text-white/70 shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white/70 truncate leading-none">{userName}</p>
            <p className="text-[10px] text-white/25 truncate mt-0.5 capitalize">{userRole.toLowerCase()}</p>
          </div>
          <button
            onClick={() => setShowSignOut(s => !s)}
            title="Sign out"
            className="p-1 rounded text-white/20 hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
        {showSignOut && (
          <div className="mt-1 mx-1 rounded-md border border-white/[0.08] bg-[#1a1b24] overflow-hidden">
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-red-400 hover:bg-red-500/10 transition-colors"
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
      <div className="lg:hidden flex items-center justify-between px-4 h-14 bg-[#0d0e14] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-emerald-500 rounded-md flex items-center justify-center">
            <GraduationCap className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-bold text-white text-sm">Skula</span>
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="p-1.5 rounded-md text-white/40 hover:text-white hover:bg-white/[0.06] transition-colors"
        >
          {open ? <X className="h-4.5 w-4.5 h-[18px] w-[18px]" /> : <Menu className="h-[18px] w-[18px]" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)}>
          <div className="w-56 h-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <NavContent role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-52 shrink-0 min-h-screen border-r border-white/[0.06]">
        <NavContent role={role} />
      </aside>
    </>
  );
}
