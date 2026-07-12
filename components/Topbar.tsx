"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, ChevronDown, Settings, LogOut, Globe } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type Notif = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

const ROLE_COLOR: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-500/15 text-violet-300 border-violet-500/25",
  ADMIN:       "bg-blue-500/15 text-blue-300 border-blue-500/25",
  TEACHER:     "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
  ACCOUNTANT:  "bg-amber-500/15 text-amber-300 border-amber-500/25",
  STUDENT:     "bg-sky-500/15 text-sky-300 border-sky-500/25",
  PARENT:      "bg-orange-500/15 text-orange-300 border-orange-500/25",
  LIBRARIAN:   "bg-pink-500/15 text-pink-300 border-pink-500/25",
  RECEPTIONIST: "bg-teal-500/15 text-teal-300 border-teal-500/25",
};

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const role    = (session?.user as any)?.role ?? "";
  const userId  = (session?.user as any)?.id ?? "";
  const email   = session?.user?.email ?? "";
  const name    = (session?.user as any)?.name || email.split("@")[0] || "User";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  const [notifOpen,   setNotifOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [unread,  setUnread]  = useState(0);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}&pageSize=8`)
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications ?? []); setUnread(d.unreadCount ?? 0); })
      .catch(() => {});
  }, [userId]);

  useEffect(() => {
    function handle(e: MouseEvent) {
      if (notifRef.current   && !notifRef.current.contains(e.target as Node))   setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function markAllRead() {
    if (!userId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markAll: true, userId }),
    });
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  }

  const badgeCls = ROLE_COLOR[role] ?? "bg-slate-500/15 text-slate-300 border-slate-500/25";

  return (
    <header
      className="hidden lg:flex h-14 items-center justify-between px-5 md:px-6 bg-white border-b border-slate-100 shrink-0 sticky top-0 z-10"
      style={{ boxShadow: "0 1px 0 #e2e8f0, 0 2px 8px rgba(0,0,0,0.04)" }}
    >
      {/* Left: page title */}
      <h1 className="text-[17px] font-black text-slate-900 tracking-tight">{title}</h1>

      {/* Right */}
      <div className="flex items-center gap-1">

        {/* Search */}
        <button className="hidden md:flex items-center gap-2.5 px-3 h-8 rounded-lg bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-400 hover:text-slate-600 transition-all text-[12px] mr-1">
          <Search className="h-3.5 w-3.5" />
          <span className="text-slate-400">Search</span>
          <kbd className="ml-1 text-[10px] border border-slate-200 rounded px-1 py-0.5 font-mono text-slate-300 bg-white">⌘K</kbd>
        </button>

        {/* View public website */}
        <a
          href="/?preview=1"
          target="_blank"
          rel="noopener noreferrer"
          title="View your public website"
          aria-label="View your public website"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Globe className="h-[18px] w-[18px]" />
        </a>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            aria-label={unread > 0 ? `Notifications (${unread} unread)` : "Notifications"}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-1.5rem))] bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
              style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)" }}>
              <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-100">
                <p className="text-[14px] font-bold text-slate-900">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[12px] text-indigo-600 hover:text-indigo-700 font-semibold">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-50">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                    <p className="text-[13px] text-slate-400">All caught up!</p>
                  </div>
                ) : notifs.map(n => (
                  <div key={n.id} className={`px-4 py-3 hover:bg-slate-50 transition-colors ${!n.isRead ? "bg-indigo-50/40" : ""}`}>
                    <div className="flex gap-2.5">
                      {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 shrink-0" />}
                      <div className={!n.isRead ? "" : "ml-[14px]"}>
                        <p className="text-[12px] font-semibold text-slate-800">{n.title}</p>
                        <p className="text-[12px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-[11px] text-slate-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-100">
                <Link href="/notifications" className="text-[12px] text-indigo-600 hover:text-indigo-700 font-semibold">
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="w-px h-5 bg-slate-100 mx-1" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-slate-800 leading-tight">{name}</p>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${badgeCls}`}>
                {role.replace("_", " ")}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-300 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden"
              style={{ boxShadow: "0 4px 6px rgba(0,0,0,0.04), 0 12px 32px rgba(0,0,0,0.08)" }}>
              <div className="px-4 py-3.5 border-b border-slate-100">
                <p className="text-[14px] font-semibold text-slate-900">{name}</p>
                <p className="text-[12px] text-slate-400 truncate mt-0.5">{email}</p>
              </div>
              <div className="p-1.5">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  <Settings className="h-3.5 w-3.5 text-slate-400" /> Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-[13px] text-rose-500 hover:bg-rose-50 w-full transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
