"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  BookOpen,
  DollarSign,
  Bell,
  GraduationCap,
  LogOut,
  Menu,
  X,
  TrendingUp,
  UserCog,
  Calendar,
  FileText,
  BarChart2,
  Banknote,
  BookOpen,
  Bus,
  Building,
  Package,
  ConciergeBell,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/students", label: "Students", icon: Users },
  { href: "/attendance", label: "Attendance", icon: ClipboardList },
  { href: "/exam-groups", label: "Exams & Marks", icon: BookOpen },
  { href: "/results", label: "Results", icon: TrendingUp },
  { href: "/fees", label: "Fees", icon: DollarSign },
  { href: "/staff", label: "Staff", icon: UserCog },
  { href: "/timetable", label: "Timetable", icon: Calendar },
  { href: "/homework", label: "Homework", icon: FileText },
  { href: "/finance", label: "Finance", icon: Banknote },
  { href: "/library", label: "Library", icon: BookOpen },
  { href: "/transport", label: "Transport", icon: Bus },
  { href: "/hostel", label: "Hostel", icon: Building },
  { href: "/inventory", label: "Inventory", icon: Package },
  { href: "/front-office", label: "Front Office", icon: ConciergeBell },
  { href: "/reports", label: "Reports", icon: BarChart2 },
  { href: "/notifications", label: "Notifications", icon: Bell },
];

export function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav = (
    <nav className="flex flex-col gap-1 p-3">
      {navItems.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
            pathname.startsWith(href) && href !== "/dashboard"
              ? "bg-blue-600 text-white"
              : pathname === href
              ? "bg-blue-600 text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          )}
        >
          <Icon className="h-4 w-4 shrink-0" />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b">
        <div className="flex items-center gap-2">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">School MS</span>
        </div>
        <button onClick={() => setOpen(!open)} className="p-1 rounded-md text-gray-600 hover:bg-gray-100">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-40 bg-black/40" onClick={() => setOpen(false)}>
          <div className="w-64 h-full bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-2 px-5 py-4 border-b">
              <GraduationCap className="h-6 w-6 text-blue-600" />
              <span className="font-bold text-gray-900">School MS</span>
            </div>
            {nav}
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 bg-white border-r min-h-screen">
        <div className="flex items-center gap-2 px-5 py-5 border-b">
          <GraduationCap className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-gray-900">School MS</span>
        </div>
        <div className="flex-1 overflow-y-auto">{nav}</div>
        <div className="p-3 border-t">
          <button
            onClick={() => signOut({ callbackUrl: "/sign-in" })}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
