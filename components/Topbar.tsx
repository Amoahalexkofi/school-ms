"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, Settings, LogOut, X } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type Notif = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

const ROLE_BADGE: Record<string, string> = {
  SUPER_ADMIN: "bg-violet-500/10 text-violet-400 ring-violet-500/20",
  ADMIN:       "bg-blue-500/10 text-blue-400 ring-blue-500/20",
  TEACHER:     "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20",
  ACCOUNTANT:  "bg-amber-500/10 text-amber-400 ring-amber-500/20",
  STUDENT:     "bg-sky-500/10 text-sky-400 ring-sky-500/20",
  PARENT:      "bg-orange-500/10 text-orange-400 ring-orange-500/20",
  LIBRARIAN:   "bg-pink-500/10 text-pink-400 ring-pink-500/20",
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
  const [searchOpen,  setSearchOpen]  = useState(false);
  const [notifs,  setNotifs]  = useState<Notif[]>([]);
  const [unread,  setUnread]  = useState(0);
  const notifRef   = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const searchRef  = useRef<HTMLDivElement>(null);

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
      if (searchRef.current  && !searchRef.current.contains(e.target as Node))  setSearchOpen(false);
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

  const badgeCls = ROLE_BADGE[role] ?? "bg-white/5 text-white/30 ring-white/10";

  return (
    <header className="h-14 flex items-center justify-between px-5 md:px-6 border-b border-white/[0.06] bg-[#0d0e14] shrink-0">

      {/* Left: page title */}
      <h1 className="text-[15px] font-semibold text-white/80 tracking-tight">{title}</h1>

      {/* Right controls */}
      <div className="flex items-center gap-1.5">

        {/* Search — expands inline */}
        <div ref={searchRef} className="relative">
          {searchOpen ? (
            <div className="flex items-center gap-2 bg-white/[0.06] border border-white/[0.1] rounded-lg px-3 h-8 w-52 ring-1 ring-emerald-500/30">
              <Search className="h-3.5 w-3.5 text-white/30 shrink-0" />
              <input
                autoFocus
                type="text"
                placeholder="Search…"
                className="bg-transparent text-[13px] text-white/70 placeholder-white/20 outline-none w-full"
              />
              <button onClick={() => setSearchOpen(false)}>
                <X className="h-3.5 w-3.5 text-white/20 hover:text-white/50 transition-colors" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-colors"
          >
            <Bell className="h-4 w-4" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-emerald-400 rounded-full" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-[#13141f] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[13px] font-semibold text-white/80">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-white/[0.04]">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-5 w-5 text-white/10 mx-auto mb-2" />
                    <p className="text-[12px] text-white/25">No notifications</p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-white/[0.03] transition-colors ${!n.isRead ? "bg-emerald-500/[0.04]" : ""}`}>
                      <div className="flex gap-2.5">
                        {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />}
                        <div className={!n.isRead ? "" : "ml-4"}>
                          <p className="text-[12px] font-semibold text-white/70">{n.title}</p>
                          <p className="text-[11px] text-white/35 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-white/20 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-white/[0.06]">
                <Link href="/notifications" className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium">
                  View all →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-white/[0.08] mx-1" />

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.05] transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-400 shrink-0">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-semibold text-white/70 leading-none">{name}</p>
              <span className={`inline-block mt-0.5 text-[9px] font-semibold px-1.5 py-px rounded ring-1 uppercase tracking-wide ${badgeCls}`}>
                {role.replace("_", " ")}
              </span>
            </div>
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-[#13141f] border border-white/[0.08] rounded-xl shadow-2xl z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.06]">
                <p className="text-[13px] font-semibold text-white/70">{name}</p>
                <p className="text-[11px] text-white/30 truncate mt-0.5">{email}</p>
              </div>
              <div className="p-1.5 space-y-0.5">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-white/50 hover:text-white/80 hover:bg-white/[0.05] transition-colors"
                >
                  <Settings className="h-3.5 w-3.5" /> Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] text-red-400/70 hover:text-red-400 hover:bg-red-500/10 w-full transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
