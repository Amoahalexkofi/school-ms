"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Search, Users, UserCog, DollarSign, ClipboardList, BookOpen, Calendar,
  Megaphone, Settings, LayoutDashboard, CornerDownLeft,
} from "lucide-react";

type NavItem = { label: string; href: string; icon: React.ElementType; roles?: string[] };

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard",     href: "/dashboard",    icon: LayoutDashboard },
  { label: "Students",      href: "/students",     icon: Users,         roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { label: "Staff",         href: "/staff",        icon: UserCog,       roles: ["SUPER_ADMIN", "ADMIN"] },
  { label: "Fees",          href: "/fees",         icon: DollarSign,    roles: ["SUPER_ADMIN", "ADMIN", "ACCOUNTANT"] },
  { label: "Attendance",    href: "/attendance",   icon: ClipboardList, roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { label: "Exams & Marks", href: "/exams",        icon: BookOpen,      roles: ["SUPER_ADMIN", "ADMIN", "TEACHER"] },
  { label: "Timetable",     href: "/timetable",    icon: Calendar },
  { label: "Notices",       href: "/notice-board", icon: Megaphone },
  { label: "Calendar",      href: "/calendar",     icon: Calendar },
  { label: "Settings",      href: "/settings",     icon: Settings,      roles: ["SUPER_ADMIN", "ADMIN"] },
];

type ResultItem = { key: string; label: string; sub?: string; href: string; group: string; icon: React.ElementType };

export function CommandPalette() {
  const router = useRouter();
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "";

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd/Ctrl+K anywhere, and the Topbar search button dispatches this same event.
  useEffect(() => {
    function onKeydown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    }
    function onOpenEvent() { setOpen(true); }
    window.addEventListener("keydown", onKeydown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeydown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setStudents([]);
      setStaff([]);
      setActiveIndex(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  useEffect(() => {
    if (!open || query.trim().length < 2) { setStudents([]); setStaff([]); return; }
    let cancelled = false;
    setLoading(true);
    const t = setTimeout(() => {
      Promise.all([
        fetch(`/api/students?search=${encodeURIComponent(query)}&limit=5`).then((r) => r.json()).catch(() => []),
        fetch(`/api/staff?search=${encodeURIComponent(query)}`).then((r) => r.json()).catch(() => []),
      ])
        .then(([sData, tData]) => {
          if (cancelled) return;
          setStudents(Array.isArray(sData) ? sData.slice(0, 5) : []);
          setStaff(Array.isArray(tData) ? tData.slice(0, 5) : []);
        })
        .finally(() => { if (!cancelled) setLoading(false); });
    }, 250);
    return () => { cancelled = true; clearTimeout(t); };
  }, [query, open]);

  const navMatches = NAV_ITEMS
    .filter((n) => !n.roles || n.roles.includes(role))
    .filter((n) => !query.trim() || n.label.toLowerCase().includes(query.trim().toLowerCase()));

  const results: ResultItem[] = [
    ...navMatches.map((n) => ({ key: `nav-${n.href}`, label: n.label, href: n.href, group: "Go to", icon: n.icon })),
    ...students.map((s: any) => {
      const sec = s.sessions?.[0]?.classSection;
      const cls = sec ? `${sec.class?.name ?? ""} ${sec.section?.name ?? ""}`.trim() : null;
      return {
        key: `stu-${s.id}`,
        label: `${s.firstName} ${s.lastName}`,
        sub: [s.admissionNo, cls].filter(Boolean).join(" · "),
        href: `/students/${s.id}`,
        group: "Students",
        icon: Users,
      };
    }),
    ...staff.map((s: any) => ({
      key: `staff-${s.id}`,
      label: `${s.firstName} ${s.lastName}`,
      sub: [s.designation?.name, s.employeeId].filter(Boolean).join(" · "),
      href: `/staff/${s.id}`,
      group: "Staff",
      icon: UserCog,
    })),
  ];

  const groups = results.reduce<Record<string, ResultItem[]>>((acc, r) => {
    (acc[r.group] ??= []).push(r);
    return acc;
  }, {});

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); const r = results[activeIndex]; if (r) go(r.href); }
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-slate-900/25 backdrop-blur-[2px] data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150"
        />
        <DialogPrimitive.Popup
          aria-label="Search"
          className="fixed left-1/2 top-[14%] z-50 w-full max-w-lg -translate-x-1/2 rounded-2xl bg-white overflow-hidden outline-none data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150"
          style={{ boxShadow: "0 10px 40px rgba(0,0,0,0.16)" }}
        >
          <div className="flex items-center gap-2.5 px-4 h-12 border-b border-slate-100">
            <Search className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={onInputKeyDown}
              placeholder="Search students, staff, or jump to a page…"
              className="flex-1 h-full bg-transparent text-[14px] text-slate-800 placeholder:text-slate-400 outline-none"
            />
            <kbd className="text-[10px] border border-slate-200 rounded px-1.5 py-0.5 font-mono text-slate-400 bg-slate-50">esc</kbd>
          </div>

          <div className="max-h-[min(60vh,420px)] overflow-y-auto py-1.5">
            {loading && <p className="px-4 py-2 text-[12px] text-slate-400">Searching…</p>}
            {results.length === 0 && !loading && (
              <p className="px-4 py-8 text-[13px] text-slate-400 text-center">
                {query.trim() ? "No matches." : "Type to search, or pick a shortcut."}
              </p>
            )}
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-4 pt-2 pb-1 text-[11px] font-medium text-slate-400 uppercase tracking-wider">{group}</p>
                {items.map((item) => {
                  const idx = results.indexOf(item);
                  const active = idx === activeIndex;
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      onMouseEnter={() => setActiveIndex(idx)}
                      onClick={() => go(item.href)}
                      className={`w-full flex items-center gap-3 px-4 py-2 text-left transition-colors ${active ? "bg-indigo-50" : "hover:bg-slate-50"}`}
                    >
                      <Icon className={`h-4 w-4 shrink-0 ${active ? "text-indigo-600" : "text-slate-400"}`} />
                      <span className="min-w-0 flex-1">
                        <span className={`block text-[13px] font-medium truncate ${active ? "text-indigo-700" : "text-slate-800"}`}>{item.label}</span>
                        {item.sub && <span className="block text-[11.5px] text-slate-400 truncate">{item.sub}</span>}
                      </span>
                      {active && <CornerDownLeft className="h-3.5 w-3.5 text-indigo-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
