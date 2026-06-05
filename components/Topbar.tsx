"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell } from "lucide-react";

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-700",
  ADMIN: "bg-blue-100 text-blue-700",
  TEACHER: "bg-green-100 text-green-700",
  ACCOUNTANT: "bg-yellow-100 text-yellow-700",
  STUDENT: "bg-gray-100 text-gray-700",
  PARENT: "bg-orange-100 text-orange-700",
  LIBRARIAN: "bg-pink-100 text-pink-700",
};

type Notif = { id: string; title: string; message: string; isRead: boolean; createdAt: string };

export function Topbar({ title }: { title: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role ?? "";
  const userId = (session?.user as any)?.id ?? "";
  const email = session?.user?.email ?? "";
  const initials = email.slice(0, 2).toUpperCase();

  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [unread, setUnread] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userId) return;
    fetch(`/api/notifications?userId=${userId}&pageSize=10`)
      .then(r => r.json())
      .then(d => { setNotifs(d.notifications ?? []); setUnread(d.unreadCount ?? 0); })
      .catch(() => {});
  }, [userId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
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

  async function markOneRead(id: string) {
    await fetch("/api/notifications", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setNotifs(n => n.map(x => x.id === id ? { ...x, isRead: true } : x));
    setUnread(u => Math.max(0, u - 1));
  }

  return (
    <header className="bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>

      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <div className="relative" ref={ref}>
          <button
            onClick={() => setOpen(o => !o)}
            className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-lg border z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <p className="text-sm font-semibold text-gray-800">Notifications</p>
                {unread > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y">
                {notifs.length === 0 ? (
                  <p className="text-sm text-gray-400 text-center py-8">No notifications</p>
                ) : (
                  notifs.map(n => (
                    <button
                      key={n.id}
                      onClick={() => !n.isRead && markOneRead(n.id)}
                      className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${!n.isRead ? "bg-blue-50/60" : ""}`}
                    >
                      <div className="flex items-start gap-2">
                        {!n.isRead && <span className="mt-1.5 h-2 w-2 rounded-full bg-blue-500 shrink-0" />}
                        <div className={!n.isRead ? "" : "ml-4"}>
                          <p className="text-xs font-semibold text-gray-800 leading-snug">{n.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{n.message}</p>
                          <p className="text-[10px] text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {notifs.length > 0 && (
                <div className="px-4 py-2 border-t">
                  <a href="/notifications" className="text-xs text-blue-600 hover:underline">View all notifications</a>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Role badge */}
        <span className={`text-xs font-medium px-2 py-1 rounded-full hidden sm:inline-block ${roleColors[role] ?? "bg-gray-100 text-gray-700"}`}>
          {role.replace("_", " ")}
        </span>

        {/* Avatar */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-600 text-white text-xs">{initials}</AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600 hidden md:block">{email}</span>
        </div>
      </div>
    </header>
  );
}
