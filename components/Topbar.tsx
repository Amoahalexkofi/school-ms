"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Bell, Search, ChevronDown, Settings, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import Link from "next/link";

type Notif = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function formatDate() {
  return new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "";
  const userId = (session?.user as any)?.id ?? "";
  const email = session?.user?.email ?? "";
  const name = (session?.user as any)?.name || email.split("@")[0] || "User";
  const initials = name.slice(0, 2).toUpperCase();

  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const notifRef = useRef<HTMLDivElement>(null);
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
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  async function markAllRead() {
    if (!userId) return;
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAll: true, userId }) });
    setNotifs(n => n.map(x => ({ ...x, isRead: true })));
    setUnread(0);
  }

  const roleColors: Record<string, string> = {
    SUPER_ADMIN: "bg-purple-100 text-purple-700",
    ADMIN: "bg-blue-100 text-blue-700",
    TEACHER: "bg-emerald-100 text-emerald-700",
    ACCOUNTANT: "bg-amber-100 text-amber-700",
    STUDENT: "bg-sky-100 text-sky-700",
    PARENT: "bg-orange-100 text-orange-700",
    LIBRARIAN: "bg-pink-100 text-pink-700",
  };

  return (
    <header className="bg-white border-b border-gray-100 px-4 md:px-6 py-0 flex items-center justify-between gap-3 h-14 md:h-16 shrink-0">
      {/* Left: greeting + title */}
      <div className="flex flex-col justify-center min-w-0">
        <h1 className="text-base font-bold text-gray-900 leading-tight truncate">{title}</h1>
        <p className="text-xs text-gray-400 hidden sm:block">{formatDate()}</p>
      </div>

      {/* Right: search + notif + profile */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search */}
        <div className="hidden md:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-52 hover:border-blue-300 transition-colors">
          <Search className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          <input
            type="text"
            placeholder="Search…"
            className="bg-transparent text-xs text-gray-600 placeholder-gray-400 outline-none w-full"
          />
        </div>

        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => { setNotifOpen(o => !o); setProfileOpen(false); }}
            className="relative w-9 h-9 flex items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-4.5 w-4.5 h-[18px] w-[18px]" />
            {unread > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-full mt-2 w-[min(320px,calc(100vw-2rem))] bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                <div>
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  {unread > 0 && <p className="text-xs text-gray-400">{unread} unread</p>}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                {notifs.length === 0 ? (
                  <div className="py-10 text-center">
                    <Bell className="h-6 w-6 text-gray-200 mx-auto mb-2" />
                    <p className="text-sm text-gray-400">All caught up!</p>
                  </div>
                ) : (
                  notifs.map(n => (
                    <div key={n.id} className={`px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/40" : ""}`}>
                      <div className="flex gap-2.5">
                        {!n.isRead && <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-blue-500 shrink-0" />}
                        <div className={!n.isRead ? "" : "ml-[14px]"}>
                          <p className="text-xs font-semibold text-gray-800">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/50">
                <Link href="/notifications" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  View all notifications →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => { setProfileOpen(o => !o); setNotifOpen(false); }}
            className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-semibold text-gray-800 leading-tight">{name}</p>
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${roleColors[role] ?? "bg-gray-100 text-gray-600"}`}>
                {role.replace("_", " ")}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-gray-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-semibold text-gray-900">{name}</p>
                <p className="text-xs text-gray-400 truncate">{email}</p>
              </div>
              <div className="p-1.5">
                <Link href="/settings" onClick={() => setProfileOpen(false)} className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                  <Settings className="h-3.5 w-3.5 text-gray-400" /> Settings
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/sign-in" })}
                  className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-600 hover:bg-red-50 w-full transition-colors"
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
