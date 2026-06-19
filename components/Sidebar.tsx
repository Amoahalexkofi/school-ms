"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, ClipboardList, BookOpen, DollarSign,
  GraduationCap, LogOut, Menu, X, TrendingUp, UserCog, Calendar,
  FileText, BarChart2, Banknote, Library, Bus, Building, Package,
  ConciergeBell, Monitor, UserPlus, ShieldCheck, Settings, ScrollText,
  Megaphone, Send, MessageCircle, Layers, Home, CreditCard, CheckSquare,
  Bell, ChevronDown, Globe,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { usePermissions } from "@/components/PermissionsProvider";

type StaffRole = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN";
type NavItem  = { href: string; label: string; icon: React.ElementType; roles?: StaffRole[]; perm?: string };
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
      { href: "/students",   label: "Students",   icon: Users,         roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "student_information" },
      { href: "/staff",      label: "Staff",       icon: UserCog,       roles: ["SUPER_ADMIN","ADMIN"],           perm: "human_resource" },
      { href: "/admissions", label: "Admissions",  icon: UserPlus,      roles: ["SUPER_ADMIN","ADMIN"],           perm: "front_office" },
      { href: "/alumni",     label: "Alumni",      icon: GraduationCap, roles: ["SUPER_ADMIN","ADMIN"],           perm: "alumni" },
    ],
  },
  {
    label: "Academics",
    items: [
      { href: "/attendance",     label: "Attendance",    icon: ClipboardList, roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "student_attendance" },
      { href: "/exam-groups",    label: "Exams & Marks", icon: BookOpen,      roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "examination" },
      { href: "/results",        label: "Results",       icon: TrendingUp,    roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "academics" },
      { href: "/timetable",      label: "Timetable",     icon: Calendar,      roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "academics" },
      { href: "/homework",       label: "Homework",      icon: FileText,      roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "homework" },
      { href: "/lesson-plans",   label: "Lesson Plans",  icon: ScrollText,    roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "lesson_plan" },
      { href: "/subject-groups", label: "Subjects",      icon: Layers,        roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "academics" },
      { href: "/online-exams",   label: "Online Exams",  icon: Monitor,       roles: ["SUPER_ADMIN","ADMIN","TEACHER"], perm: "online_examination" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/fees",     label: "Fees",     icon: DollarSign, roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"], perm: "fees_collection" },
      { href: "/finance",  label: "Finance",  icon: Banknote,   roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"], perm: "expense" },
      { href: "/payroll",  label: "Payroll",  icon: CreditCard, roles: ["SUPER_ADMIN","ADMIN","ACCOUNTANT"], perm: "human_resource" },
    ],
  },
  {
    label: "Operations",
    items: [
      { href: "/library",      label: "Library",      icon: Library,      roles: ["SUPER_ADMIN","ADMIN","LIBRARIAN","TEACHER"], perm: "library" },
      { href: "/transport",    label: "Transport",    icon: Bus,           roles: ["SUPER_ADMIN","ADMIN"],                        perm: "transport" },
      { href: "/hostel",       label: "Hostel",       icon: Building,      roles: ["SUPER_ADMIN","ADMIN"],                        perm: "hostel" },
      { href: "/inventory",    label: "Inventory",    icon: Package,       roles: ["SUPER_ADMIN","ADMIN"],                        perm: "inventory" },
      { href: "/front-office", label: "Front Office", icon: ConciergeBell, roles: ["SUPER_ADMIN","ADMIN"],                        perm: "front_office" },
    ],
  },
  {
    label: "Communication",
    items: [
      { href: "/notice-board", label: "Notices",   icon: Megaphone,    roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN"], perm: "communicate" },
      { href: "/messaging",    label: "Messaging", icon: Send,          roles: ["SUPER_ADMIN","ADMIN"],                                    perm: "communicate" },
      { href: "/chat",         label: "Chat",      icon: MessageCircle, roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT","LIBRARIAN"], perm: "chat" },
    ],
  },
  {
    label: "Website",
    items: [
      { href: "/website", label: "My Website", icon: Globe, roles: ["SUPER_ADMIN","ADMIN"], perm: "system_settings" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/reports",   label: "Reports",   icon: BarChart2,   roles: ["SUPER_ADMIN","ADMIN","TEACHER","ACCOUNTANT"], perm: "reports" },
      { href: "/audit-log", label: "Audit Log", icon: ShieldCheck, roles: ["SUPER_ADMIN","ADMIN"],                         perm: "system_settings" },
      { href: "/settings",  label: "Settings",  icon: Settings,    roles: ["SUPER_ADMIN","ADMIN"],                         perm: "system_settings" },
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

const ALL_ITEMS = [...adminGroups, ...studentGroups, ...parentGroups].flatMap(g => g.items);

type Role = "SUPER_ADMIN" | "ADMIN" | "TEACHER" | "ACCOUNTANT" | "LIBRARIAN" | "STUDENT" | "PARENT" | string;

function getGroups(role: Role): NavGroup[]  { return role === "STUDENT" ? studentGroups : role === "PARENT" ? parentGroups : adminGroups; }
function getPortalLabel(role: Role)         { return role === "STUDENT" ? "Student" : role === "PARENT" ? "Parent" : null; }

function NavContent({ role, onNavigate }: { role: Role; onNavigate?: () => void }) {
  const pathname  = usePathname();
  const { data: session } = useSession();
  const [showUser, setShowUser] = useState(false);

  const perms       = usePermissions();
  const rawGroups   = getGroups(role);
  const staffRole   = role as StaffRole;
  const groups      = rawGroups.map(g => ({
    ...g,
    items: g.items.filter(item => {
      if (item.roles && !item.roles.includes(staffRole)) return false;
      if (perms && item.perm) return perms[item.perm]?.canView === true;
      return true;
    }),
  })).filter(g => g.items.length > 0);

  const portalLabel = getPortalLabel(role);
  const userName    = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const userEmail   = session?.user?.email ?? "";
  const userRole    = ((session?.user as any)?.role ?? role ?? "").replace(/_/g, " ").toLowerCase();
  const initials    = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="flex flex-col h-full bg-slate-900">

      {/* Logo */}
      <div className="h-14 px-4 flex items-center gap-2.5 border-b border-white/[0.06] shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-900/40">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        <span className="font-black text-white text-[16px] tracking-tight">Skula</span>
        {portalLabel && (
          <span className="ml-auto text-[10px] font-bold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.5 rounded-md border border-indigo-500/30">
            {portalLabel}
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-none">
        {groups.map((group, gi) => (
          <div key={group.label} className={cn(gi > 0 && "mt-5")}>
            <p className="px-2.5 mb-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-[0.09em] select-none">
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
                    "flex items-center gap-2.5 h-9 px-2.5 rounded-lg text-[13px] font-medium transition-all duration-100 group",
                    active
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-900/40"
                      : "text-slate-400 hover:bg-white/[0.07] hover:text-white"
                  )}
                >
                  <Icon className={cn(
                    "h-[15px] w-[15px] shrink-0 transition-colors",
                    active ? "text-white" : "text-slate-500 group-hover:text-slate-300"
                  )} />
                  <span className="truncate">{label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="shrink-0 px-2 pb-3 pt-2 border-t border-white/[0.06]">
        <button
          onClick={() => setShowUser(s => !s)}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/[0.07] transition-colors text-left group"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-white truncate leading-none">{userName}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5 capitalize">{userRole}</p>
          </div>
          <ChevronDown className={cn(
            "h-3 w-3 text-slate-600 shrink-0 transition-transform duration-150",
            showUser && "rotate-180"
          )} />
        </button>

        {showUser && (
          <div className="mt-1.5 mx-0.5 rounded-xl border border-white/[0.08] bg-slate-800 shadow-xl overflow-hidden">
            <div className="px-3 py-2.5 border-b border-white/[0.06]">
              <p className="text-[11px] text-slate-500 truncate">{userEmail}</p>
            </div>
            <Link
              href="/settings/school-profile"
              onClick={() => setShowUser(false)}
              className="flex items-center gap-2 px-3 py-2.5 text-[12px] text-slate-300 hover:bg-white/[0.07] hover:text-white transition-colors"
            >
              <Settings className="h-3.5 w-3.5 text-slate-500" /> Settings
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-[12px] text-rose-400 hover:bg-rose-500/10 transition-colors"
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
  const [unread, setUnread] = useState(0);
  const pathname = usePathname();
  const { data: session } = useSession();

  const userName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "User";
  const userRole = ((session?.user as any)?.role ?? role ?? "").replace(/_/g, " ");
  const initials = userName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const userId   = (session?.user as any)?.id ?? "";

  const currentItem = ALL_ITEMS.find(item =>
    item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
  );
  const pageTitle = currentItem?.label ?? "Dashboard";

  // Fetch unread notification count for mobile bell
  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}&pageSize=1`)
      .then(r => r.json())
      .then(d => setUnread(d.unreadCount ?? 0))
      .catch(() => {});
  }, [userId]);

  return (
    <>
      {/* Mobile topbar */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-slate-900 border-b border-white/[0.06]">
        {/* Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Current page name — centre */}
        <p className="text-white font-bold text-[15px] tracking-tight absolute left-1/2 -translate-x-1/2">
          {pageTitle}
        </p>

        {/* Right: bell + avatar */}
        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="relative w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-2 right-2 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-slate-900" />
            )}
          </Link>
          <button
            onClick={() => setOpen(true)}
            className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-[11px] font-bold text-white shrink-0"
            aria-label="Open menu"
          >
            {initials}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-64 h-full bg-slate-900 shadow-2xl flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <NavContent role={role} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 bg-slate-900 min-h-screen">
        <NavContent role={role} />
      </aside>
    </>
  );
}
