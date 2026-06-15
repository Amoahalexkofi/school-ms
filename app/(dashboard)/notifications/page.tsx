"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Topbar } from "@/components/Topbar";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck } from "lucide-react";

const TYPE_STYLES: Record<string, string> = {
  FEE_DUE: "bg-red-500/10 text-red-400",
  RESULT_PUBLISHED: "bg-emerald-500/10 text-emerald-400",
  HOMEWORK_ASSIGNED: "bg-blue-500/10 text-blue-400",
  EXAM_SCHEDULED: "bg-violet-500/10 text-violet-400",
  ABSENCE_MARKED: "bg-orange-500/10 text-orange-400",
  GENERAL: "bg-white/[0.04] text-white/60",
};

export default function NotificationsPage() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const userId = (session?.user as any)?.id;

  async function load() {
    if (!userId) return;
    const res = await fetch(`/api/notifications?userId=${userId}`).catch(() => null);
    if (res?.ok) {
      const d = await res.json();
      setNotifications(d.notifications ?? []);
      setUnreadCount(d.unreadCount ?? 0);
    }
    setLoading(false);
  }

  useEffect(() => { load(); }, [userId]);

  async function markAllRead() {
    if (!userId) return;
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, markAll: true }),
    });
    await load();
  }

  async function markRead(id: string) {
    await fetch("/api/notifications", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    await load();
  }

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Notifications" />
      <main className="flex-1 p-6 space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllRead} className="gap-1.5">
              <CheckCheck className="h-3.5 w-3.5" /> Mark all read
            </Button>
          )}
        </div>

        {loading ? (
          <div className="text-center py-12 text-white/30">Loading…</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Bell className="h-10 w-10 mx-auto mb-3 opacity-40" />
            <p>No notifications yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((n: any) => (
              <div
                key={n.id}
                className={`flex items-start gap-3 p-4 rounded-xl border transition-all ${
                  n.isRead ? "bg-[#111318] border-white/[0.04]" : "bg-blue-500/10 border-blue-500/20"
                }`}
              >
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-0.5 shrink-0 ${TYPE_STYLES[n.type] ?? "bg-white/[0.04] text-white/60"}`}>
                  {n.type.replace(/_/g, " ")}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm text-white/80">{n.title}</p>
                  <p className="text-xs text-white/40 mt-0.5">{n.message}</p>
                  <p className="text-xs text-white/30 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <button onClick={() => markRead(n.id)} className="text-xs text-blue-400 hover:underline shrink-0">
                    Mark read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
